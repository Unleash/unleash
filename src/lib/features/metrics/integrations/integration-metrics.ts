import { Counter, Gauge } from 'prom-client';
import type { Logger, LogProvider } from '../../../logger.js';
import type { IUnleashStores } from '../../../types/stores.js';
import type { IAddonProviders } from '../../../addons/index.js';
import { AUTH_PROVIDERS_CATALOG } from '../../../types/settings/auth-settings.js';

const DEFAULT_TTL_MS = 60_000; // 1 minute

export interface IntegrationMetricsOptions {
    cacheTtlMs?: number;
}

export interface IntegrationMetricsHandles {
    authLoginTotal: Counter<'provider' | 'outcome'>;
}

export interface IntegrationMetricsDeps {
    addonProviders: IAddonProviders;
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>;
    getLogger: LogProvider;
    options?: IntegrationMetricsOptions;
}

/**
 *  metrics show up on `/internal-backstage/prometheus`.
 */
export function registerIntegrationMetrics(
    deps: IntegrationMetricsDeps,
): IntegrationMetricsHandles {
    const { addonProviders, stores, getLogger } = deps;
    const logger = getLogger('metrics/integrations');

    // prom-client invokes `collect()` on every call; this short cache prevents
    // lots of Prometheus replicas from hitting the database
    const ttlMs = deps.options?.cacheTtlMs ?? DEFAULT_TTL_MS;

    registerAvailableGauge(addonProviders);
    registerDeprecatedInfoGauge(addonProviders);
    registerConfiguredGauge({ stores, ttlMs, logger });

    return {
        // counter incremented from the enterprise auth providers on every login
        authLoginTotal: new Counter({
            name: 'auth_login_total',
            help: 'Authentication attempts by provider per outcome.',
            labelNames: ['provider', 'outcome'] as const,
        }),
    };
}

/**
 *  `integration_available{name, kind, deprecated}`
 *  all available integrations of this server. value=1: registered entry.
 */
function registerAvailableGauge(addonProviders: IAddonProviders): void {
    const gauge = new Gauge({
        name: 'integration_available',
        help: 'Available integrations  with this Unleash server. value=1: available.',
        labelNames: ['name', 'kind', 'deprecated'] as const,
    });

    for (const addon of Object.values(addonProviders)) {
        gauge
            .labels({
                name: addon.definition.name,
                kind: 'addon',
                deprecated: String(Boolean(addon.definition.deprecated)),
            })
            .set(1);
    }

    for (const provider of Object.values(AUTH_PROVIDERS_CATALOG)) {
        gauge
            .labels({
                name: provider.name,
                kind: 'auth',
                deprecated: String(Boolean(provider.deprecatedRemovalTarget)),
            })
            .set(1);
    }
}

/**
 * `integration_deprecated_info{name, kind, removal_target}`
 *  list of gauges with deprecated integrations.
 *
 *  e.g. `integration_configured{state="enabled"} * on(name, kind)
 *      group_left integration_deprecated_info > 0`.
 */
function registerDeprecatedInfoGauge(addonProviders: IAddonProviders): void {
    const gauge = new Gauge({
        name: 'integration_deprecated_info',
        help: 'Deprecated integrations on this server. value=1 always. Use it as a join target in alert rules.',
        labelNames: ['name', 'kind', 'removal_target'] as const,
    });

    for (const addon of Object.values(addonProviders)) {
        const deprecated = addon.definition.deprecated;
        if (deprecated) {
            gauge
                .labels({
                    name: addon.definition.name,
                    kind: 'addon',
                    removal_target: deprecated,
                })
                .set(1);
        }
    }

    for (const provider of Object.values(AUTH_PROVIDERS_CATALOG)) {
        if (provider.deprecatedRemovalTarget) {
            gauge
                .labels({
                    name: provider.name,
                    kind: 'auth',
                    removal_target: provider.deprecatedRemovalTarget,
                })
                .set(1);
        }
    }
}

interface ConfiguredSample {
    name: string;
    kind: 'addon' | 'auth';
    state: 'enabled' | 'disabled' | 'not_configured';
    count: number;
}

/**
 * `integration_configured{name, kind, state}`
 *  lists configured instances per integration and state (`enabled`/`disabled`)
 *  plus `not_configured` for auth providers that have never been saved.
 */
function registerConfiguredGauge(args: {
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>;
    ttlMs: number;
    logger: Logger;
}): void {
    const { stores, ttlMs, logger } = args;
    const cache: { ts: number; samples: ConfiguredSample[] } = {
        ts: 0,
        samples: [],
    };

    new Gauge({
        name: 'integration_configured',
        help: 'Configured integrations on this Unleash server, per state. They benefit a short TTL cache. value=1: integration is compiled in and selectable',
        labelNames: ['name', 'kind', 'state'] as const,
        async collect() {
            const now = Date.now();

            // Lazily evaluated via prom-client `collect()`, TTL-cached.
            const fresh = now - cache.ts < ttlMs && cache.samples.length > 0;

            if (!fresh) {
                try {
                    cache.samples = await collectConfiguredSamples(
                        stores,
                        logger,
                    );
                    cache.ts = now;
                } catch (err) {
                    logger.warn(
                        `failed to collect integration_configured: ${
                            (err as Error).message
                        }`,
                    );
                    if (cache.samples.length === 0) return; // prefer no gaps
                }
            }

            this.reset();
            for (const s of cache.samples) {
                this.labels({
                    name: s.name,
                    kind: s.kind,
                    state: s.state,
                }).set(s.count);
            }
        },
    });
}
export async function collectConfiguredSamples(
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>,
    logger?: Logger,
): Promise<ConfiguredSample[]> {
    const samples: ConfiguredSample[] = [];

    // Addons
    const addons = await stores.addonStore.getAll();
    const addonBuckets = new Map<
        string,
        { enabled: number; disabled: number }
    >();

    for (const addon of addons) {
        const bucket = addonBuckets.get(addon.provider) ?? {
            enabled: 0,
            disabled: 0,
        };

        if (addon.enabled) {
            bucket.enabled++;
        } else {
            bucket.disabled++;
        }

        addonBuckets.set(addon.provider, bucket);
    }

    // Only push if count > 0 to avoid empty entries
    for (const [provider, bucket] of addonBuckets) {
        if (bucket.enabled > 0) {
            samples.push({
                name: provider,
                kind: 'addon',
                state: 'enabled',
                count: bucket.enabled,
            });
        }
        if (bucket.disabled > 0) {
            samples.push({
                name: provider,
                kind: 'addon',
                state: 'disabled',
                count: bucket.disabled,
            });
        }
    }

    // Auth providers
    const authResults = await Promise.all(
        Object.values(AUTH_PROVIDERS_CATALOG).map(async (provider) => {
            try {
                const config = await stores.settingStore.get<{
                    enabled?: boolean;
                }>(provider.configId);

                const state = config
                    ? config.enabled
                        ? 'enabled'
                        : 'disabled'
                    : 'not_configured';

                return {
                    name: provider.name,
                    kind: 'auth',
                    state,
                    count: 1,
                };
            } catch (error) {
                logger?.warn(
                    `Failed to fetch auth config for ${provider.name}`,
                    { error },
                );
                return null;
            }
        }),
    );

    const validAuthSamples = authResults.filter(
        (result): result is ConfiguredSample => result !== null,
    );

    samples.push(...validAuthSamples);

    return samples;
}
