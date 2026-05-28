import EventEmitter from 'events';
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

const testConfig = {
    getLogger: noLogger,
    server: { unleashUrl: 'http://localhost:4242' },
    flagResolver: { isEnabled: () => false } as any,
} as any;

const setupMetrics = (overrides: {
    addonProviders?: IAddonProviders;
    stores: any;
    options?: { cacheTtlMs?: number };
}) => {
    const eventBus = new EventEmitter();

    registerIntegrationMetrics({
        config: testConfig,
        eventBus,
        addonProviders: overrides.addonProviders ?? {},
        stores: overrides.stores,
        options: overrides.options,
    });
    return { eventBus };
};

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
        test('emits one sample per registered addon and per known auth provider with removal_target', async () => {
            const addonProviders: IAddonProviders = {
                webhook: makeAddonProvider('webhook'),
                'slack-app': makeAddonProvider('slack-app'),
                slack: makeAddonProvider(
                    'slack',
                    'Use slack-app instead. Removed in v8.',
                ),
            };

            setupMetrics({
                addonProviders,
                stores: stores([], {}),
            });

            const output = await register.metrics();

            // Non-deprecated addons: deprecated="false", removal_target=""
            expect(output).toMatch(
                /integration_available\{[^}]*name="webhook"[^}]*kind="addon"[^}]*deprecated="false"[^}]*removal_target=""[^}]*\} 1/,
            );
            expect(output).toMatch(
                /integration_available\{[^}]*name="slack-app"[^}]*kind="addon"[^}]*deprecated="false"[^}]*removal_target=""[^}]*\} 1/,
            );

            // Deprecated addon: deprecated="true", removal_target="<message>"
            expect(output).toMatch(
                /integration_available\{[^}]*name="slack"[^}]*kind="addon"[^}]*deprecated="true"[^}]*removal_target="Use slack-app instead\. Removed in v8\."[^}]*\} 1/,
            );

            // All auth providers are present
            for (const provider of Object.values(AUTH_PROVIDERS_CATALOG)) {
                const expectedDeprecated = provider.deprecatedRemovalTarget
                    ? 'true'
                    : 'false';
                const expectedRemovalTarget =
                    provider.deprecatedRemovalTarget ?? '';

                expect(output).toMatch(
                    new RegExp(
                        `integration_available\\{[^}]*name="${provider.name}"[^}]*kind="auth"[^}]*deprecated="${expectedDeprecated}"[^}]*removal_target="${expectedRemovalTarget}"[^}]*\\} 1`,
                    ),
                );
            }
        });

        test('removal_target label is populated only for deprecated integrations', async () => {
            const addonProviders: IAddonProviders = {
                'old-addon': makeAddonProvider('old-addon', 'v7.0.0'),
            };

            setupMetrics({
                addonProviders,
                stores: stores([], {}),
            });

            const output = await register.metrics();

            // Verify deprecated addon has removal_target set
            expect(output).toMatch(
                /integration_available\{[^}]*name="old-addon"[^}]*deprecated="true"[^}]*removal_target="v7\.0\.0"[^}]*\} 1/,
            );

            // Verify Google auth provider (deprecated) has removal_target
            expect(output).toMatch(
                /integration_available\{[^}]*name="google"[^}]*kind="auth"[^}]*deprecated="true"[^}]*removal_target="v8\.0\.0"[^}]*\} 1/,
            );
        });

        test('non-deprecated integrations have empty removal_target', async () => {
            const addonProviders: IAddonProviders = {
                webhook: makeAddonProvider('webhook'),
            };

            setupMetrics({
                addonProviders,
                stores: stores([], {}),
            });

            const output = await register.metrics();

            // Non-deprecated addon should have empty removal_target
            expect(output).toMatch(
                /integration_available\{[^}]*name="webhook"[^}]*kind="addon"[^}]*deprecated="false"[^}]*removal_target=""[^}]*\} 1/,
            );

            // Non-deprecated auth providers (simple, oidc, saml) have empty removal_target
            for (const providerName of ['simple', 'oidc', 'saml']) {
                expect(output).toMatch(
                    new RegExp(
                        `integration_available\\{[^}]*name="${providerName}"[^}]*kind="auth"[^}]*deprecated="false"[^}]*removal_target=""[^}]*\\} 1`,
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

            setupMetrics({
                addonProviders: {},
                stores: stores(addonRows, {}),
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

            // Datadog has no enabled rows - even if counter is 0
            expect(output).not.toMatch(
                /integration_configured\{[^}]*name="datadog"[^}]*state="enabled"[^}]*\} 0/,
            );
        });

        test('reports auth providers as not_configured / enabled / disabled based on settings', async () => {
            setupMetrics({
                addonProviders: {},
                stores: stores([], {
                    'unleash.enterprise.auth.oidc': { enabled: true },
                    'unleash.enterprise.auth.saml': { enabled: false },
                    'unleash.enterprise.auth.google': {}, // google has a row but enabled is undefined-ish
                    // simple is missing entirely
                }),
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

            setupMetrics({
                addonProviders: {},
                stores: countingStores,
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

            setupMetrics({
                addonProviders: {},
                stores: flakyStores,
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
        test('increments when AUTH_LOGIN_COMPLETED is emitted on the eventBus', async () => {
            const { eventBus } = setupMetrics({
                addonProviders: {},
                stores: stores([], {}),
            });

            eventBus.emit('auth-login-completed', {
                provider: 'google',
                outcome: 'success',
            });
            eventBus.emit('auth-login-completed', {
                provider: 'google',
                outcome: 'success',
            });
            eventBus.emit('auth-login-completed', {
                provider: 'google',
                outcome: 'failure',
            });

            const output = await register.metrics();

            expect(output).toMatch(
                /auth_login_total\{[^}]*provider="google"[^}]*outcome="success"[^}]*\} 2/,
            );
            expect(output).toMatch(
                /auth_login_total\{[^}]*provider="google"[^}]*outcome="failure"[^}]*\} 1/,
            );
        });
    });
});
