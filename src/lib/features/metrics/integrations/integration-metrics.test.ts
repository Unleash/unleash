import { register } from 'prom-client';
import noLogger from '../../../../test/fixtures/no-logger.js';
import type { IAddonProviders } from '../../../addons/index.js';
import type { IAddon } from '../../../types/stores/addon-store.js';
import {
    AUTH_PROVIDERS_CATALOG,
    collectConfiguredSamples,
    registerIntegrationMetrics,
} from './integration-metrics.js';

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

            // The deprecated addon is still "available" (still selectable); the
            // deprecated flag is the discriminator, not the absence of a series.
            expect(output).toMatch(
                /integration_available\{[^}]*name="slack"[^}]*kind="addon"[^}]*deprecated="true"[^}]*\} 1/,
            );
            // All known auth providers are present too.
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

            // Non-deprecated addon: must NOT appear in the deprecated gauge.
            expect(output).not.toMatch(
                /integration_deprecated_info\{[^}]*name="webhook"/,
            );
            // Deprecated addon: must appear with the deprecation string.
            expect(output).toMatch(
                /integration_deprecated_info\{[^}]*name="legacy-foo"[^}]*kind="addon"[^}]*removal_target="will be removed in v9"[^}]*\} 1/,
            );
            // Deprecated auth providers from the catalog appear too.
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
        test('aggregates addons by provider × state', async () => {
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
            // Datadog has no enabled rows — confirm the zero side is also emitted
            // so dashboards have explicit zero, not absent series.
            expect(output).toMatch(
                /integration_configured\{[^}]*name="datadog"[^}]*state="enabled"[^}]*\} 0/,
            );
        });

        test('reports auth providers as not_configured / enabled / disabled based on settings rows', async () => {
            registerIntegrationMetrics({
                addonProviders: {},
                stores: stores([], {
                    'unleash.enterprise.auth.oidc': { enabled: true },
                    'unleash.enterprise.auth.saml': { enabled: false },
                    // google has a row but enabled is undefined-ish
                    'unleash.enterprise.auth.google': {},
                    // simple is missing entirely
                }),
                getLogger: noLogger,
            });

            const output = await register.metrics();

            expect(output).toMatch(
                /integration_configured\{[^}]*name="oidc"[^}]*kind="auth"[^}]*state="enabled"[^}]*\} 1/,
            );
            expect(output).toMatch(
                /integration_configured\{[^}]*name="saml"[^}]*kind="auth"[^}]*state="disabled"[^}]*\} 1/,
            );
            // Row exists but enabled is falsy → disabled
            expect(output).toMatch(
                /integration_configured\{[^}]*name="google"[^}]*kind="auth"[^}]*state="disabled"[^}]*\} 1/,
            );
            // Missing row → not_configured
            expect(output).toMatch(
                /integration_configured\{[^}]*name="simple"[^}]*kind="auth"[^}]*state="not_configured"[^}]*\} 1/,
            );
        });

        test('caches the DB read across scrapes within the TTL window', async () => {
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

            // Each scrape only reads on the first call (cache miss). Two
            // consecutive scrapes within 60s must not double-query.
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

            // First scrape: warms the cache.
            const first = await register.metrics();
            expect(first).toMatch(
                /integration_configured\{[^}]*name="webhook"[^}]*state="enabled"[^}]*\} 1/,
            );

            // Second scrape: store throws — must not throw, must serve stale.
            await expect(register.metrics()).resolves.toEqual(
                expect.any(String),
            );
            const second = await register.metrics();
            expect(second).toMatch(
                /integration_configured\{[^}]*name="webhook"[^}]*state="enabled"[^}]*\} 1/,
            );
        });
    });

    describe('collectConfiguredSamples (helper)', () => {
        test('skips auth providers whose store read throws (instead of corrupting state)', async () => {
            const throwingStores = {
                addonStore: { getAll: async () => [] },
                settingStore: {
                    get: async () => {
                        throw new Error('boom');
                    },
                },
            } as any;

            const samples = await collectConfiguredSamples(throwingStores);
            expect(samples).toEqual([]); // no auth samples produced; no exception
        });
    });
});
