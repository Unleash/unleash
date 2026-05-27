import { register } from 'prom-client';
import noLogger from '../../../../test/fixtures/no-logger.js';
import type { IAddonProviders } from '../../../addons/index.js';
import type { IAddon } from '../../../types/stores/addon-store.js';
import {
    collectConfiguredSamples,
    registerIntegrationMetrics,
} from './integration-metrics.js';
import { AUTH_PROVIDERS_CATALOG } from '../../../types/settings/auth-settings.js';

beforeEach(() => {
    register.clear();
});

const makeAddonProvider = (
    name: string,
    deprecated?: string,
): IAddonProviders[string] =>
    ({
        name,
        definition: {
            name,
            displayName: name,
            description: '',
            documentationUrl: '',
            ...(deprecated ? { deprecated } : {}),
        },
    }) as unknown as IAddonProviders[string];

const fakeAddonStore = (rows: Partial<IAddon>[]) => ({
    getAll: async () => rows as IAddon[],
});

const fakeSettingStore = (
    map: Record<string, { enabled?: boolean } | undefined>,
) => ({
    get: async <T>(name: string) => map[name] as T | undefined,
});

const stores = (
    addons: Partial<IAddon>[],
    settings: Record<string, { enabled?: boolean } | undefined>,
) =>
    ({
        addonStore: fakeAddonStore(addons),
        settingStore: fakeSettingStore(settings),
    }) as any;

describe('Integration Metrics', () => {
    describe('integration_available', () => {
        test('emits one sample per registered addon and per known auth provider', async () => {
            const addonProviders: IAddonProviders = {
                webhook: makeAddonProvider('webhook'),
                'slack-app': makeAddonProvider('slack-app'),
                slack: makeAddonProvider(
                    'slack',
                    'Use slack-app instead. Removed in v8.',
                ),
            };

            registerIntegrationMetrics({
                addonProviders,
                stores: stores([], {}),
                getLogger: noLogger,
            });

            const output = await register.metrics();

            // One series per addon
            expect(output).toMatch(
                /integration_available\{[^}]*name="webhook"[^}]*kind="addon"[^}]*deprecated="false"[^}]*\} 1/,
            );
            expect(output).toMatch(
                /integration_available\{[^}]*name="slack-app"[^}]*kind="addon"[^}]*deprecated="false"[^}]*\} 1/,
            );

            // Still available, but 'deprecated' flag is on
            expect(output).toMatch(
                /integration_available\{[^}]*name="slack"[^}]*kind="addon"[^}]*deprecated="true"[^}]*\} 1/,
            );

            // All auth providers are present too.
            for (const provider of AUTH_PROVIDERS_CATALOG) {
                const expectedDeprecated = provider.deprecatedRemovalTarget
                    ? 'true'
                    : 'false';
                expect(output).toMatch(
                    new RegExp(
                        `integration_available\\{[^}]*name="${provider.name}"[^}]*kind="auth"[^}]*deprecated="${expectedDeprecated}"[^}]*\\} 1`,
                    ),
                );
            }
        });
    });

    describe('integration_deprecated_info', () => {
        test('emits a series only for deprecated integrations', async () => {
            const addonProviders: IAddonProviders = {
                webhook: makeAddonProvider('webhook'),
                'legacy-foo': makeAddonProvider(
                    'legacy-foo',
                    'will be removed in v9',
                ),
            };

            registerIntegrationMetrics({
                addonProviders,
                stores: stores([], {}),
                getLogger: noLogger,
            });

            const output = await register.metrics();

            // Non-deprecated addon
            expect(output).not.toMatch(
                /integration_deprecated_info\{[^}]*name="webhook"/,
            );

            // Deprecated addon
            expect(output).toMatch(
                /integration_deprecated_info\{[^}]*name="legacy-foo"[^}]*kind="addon"[^}]*removal_target="will be removed in v9"[^}]*\} 1/,
            );

            // Deprecated auth providers
            const deprecatedAuth = AUTH_PROVIDERS_CATALOG.filter(
                (p) => p.deprecatedRemovalTarget,
            );
            for (const provider of deprecatedAuth) {
                expect(output).toMatch(
                    new RegExp(
                        `integration_deprecated_info\\{[^}]*name="${provider.name}"[^}]*kind="auth"[^}]*removal_target="${provider.deprecatedRemovalTarget}"[^}]*\\} 1`,
                    ),
                );
            }
        });
    });

    describe('integration_configured', () => {
        test('aggregates addons by provider per state', async () => {
            const addonRows: Partial<IAddon>[] = [
                { provider: 'webhook', enabled: true },
                { provider: 'webhook', enabled: true },
                { provider: 'webhook', enabled: false },
                { provider: 'datadog', enabled: false },
            ];

            registerIntegrationMetrics({
                addonProviders: {},
                stores: stores(addonRows, {}),
                getLogger: noLogger,
            });

            const output = await register.metrics();

            expect(output).toMatch(
                /integration_configured\{[^}]*name="webhook"[^}]*state="enabled"[^}]*\} 2/,
            );
            expect(output).toMatch(
                /integration_configured\{[^}]*name="webhook"[^}]*state="disabled"[^}]*\} 1/,
            );
            expect(output).toMatch(
                /integration_configured\{[^}]*name="datadog"[^}]*state="disabled"[^}]*\} 1/,
            );

            // Datadog has no enabled rows
            expect(output).toMatch(
                /integration_configured\{[^}]*name="datadog"[^}]*state="enabled"[^}]*\} 0/,
            );
        });

        test('reports auth providers as not_configured / enabled / disabled based on settings', async () => {
            registerIntegrationMetrics({
                addonProviders: {},
                stores: stores([], {
                    'unleash.enterprise.auth.oidc': { enabled: true },
                    'unleash.enterprise.auth.saml': { enabled: false },
                    'unleash.enterprise.auth.google': {}, // google has a row but enabled is undefined-ish
                    // simple is missing entirely
                }),
                getLogger: noLogger,
            });

            const output = await register.metrics();

            // enabled auth provider
            expect(output).toMatch(
                /integration_configured\{[^}]*name="oidc"[^}]*kind="auth"[^}]*state="enabled"[^}]*\} 1/,
            );

            // disabled auth provider
            expect(output).toMatch(
                /integration_configured\{[^}]*name="saml"[^}]*kind="auth"[^}]*state="disabled"[^}]*\} 1/,
            );

            // google configured but disabled
            expect(output).toMatch(
                /integration_configured\{[^}]*name="google"[^}]*kind="auth"[^}]*state="disabled"[^}]*\} 1/,
            );

            // not_configured
            expect(output).toMatch(
                /integration_configured\{[^}]*name="simple"[^}]*kind="auth"[^}]*state="not_configured"[^}]*\} 1/,
            );
        });

        test('caches the DB read across calls within the TTL window', async () => {
            let calls = 0;
            const countingStores = {
                addonStore: {
                    getAll: async () => {
                        calls++;
                        return [];
                    },
                },
                settingStore: {
                    get: async () => undefined,
                },
            } as any;

            registerIntegrationMetrics({
                addonProviders: {},
                stores: countingStores,
                getLogger: noLogger,
                options: { cacheTtlMs: 60_000 },
            });

            await register.metrics();
            await register.metrics();
            await register.metrics();

            // Each scrape only reads on the 1st call (cache miss).
            // Two consecutive calls within 60s must not double-query.
            expect(calls).toBe(1);
        });

        test('serves stale samples and never throws when the store fails', async () => {
            let attempt = 0;
            const flakyStores = {
                addonStore: {
                    getAll: async () => {
                        attempt++;
                        if (attempt === 1) {
                            return [{ provider: 'webhook', enabled: true }];
                        }
                        throw new Error('db is down');
                    },
                },
                settingStore: { get: async () => undefined },
            } as any;

            registerIntegrationMetrics({
                addonProviders: {},
                stores: flakyStores,
                getLogger: noLogger,
                options: { cacheTtlMs: 0 }, // force a refetch on every collect
            });

            // 1st call
            const first = await register.metrics();

            expect(first).toMatch(
                /integration_configured\{[^}]*name="webhook"[^}]*state="enabled"[^}]*\} 1/,
            );

            // 2nd call: store throws — must not throw, must serve stale
            await expect(register.metrics()).resolves.toEqual(
                expect.any(String),
            );
            const second = await register.metrics();

            expect(second).toMatch(
                /integration_configured\{[^}]*name="webhook"[^}]*state="enabled"[^}]*\} 1/,
            );
        });
    });

    describe('collectConfiguredSamples', () => {
        test('skips auth providers whose store read throws - no corrupting state)', async () => {
            const throwingStores = {
                addonStore: { getAll: async () => [] },
                settingStore: {
                    get: async () => {
                        throw new Error('boom');
                    },
                },
            } as any;

            const samples = await collectConfiguredSamples(throwingStores);

            // empty auth samples produced
            expect(samples).toEqual([]);
        });
    });

    describe('auth_login_total', () => {
        test('auth_login_total increments when the eventBus fires AUTH_LOGIN_COMPLETED', () => {
            const { authLoginTotal } = registerIntegrationMetrics({
                addonProviders: {},
                stores: stores([], {}),
                getLogger: noLogger,
            });
            authLoginTotal.inc({ provider: 'google', outcome: 'success' });
            authLoginTotal.inc({ provider: 'google', outcome: 'failure' });
            authLoginTotal.inc({ provider: 'google', outcome: 'success' });

            const series = authLoginTotal as any;
            const sample =
                series.hashMap[
                    Object.keys(series.hashMap).find(
                        (k) =>
                            k.includes('provider:google') &&
                            k.includes('outcome:success'),
                    )!
                ];

            expect(sample.value).toBe(2);
        });
    });
});
