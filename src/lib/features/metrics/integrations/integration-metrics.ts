import { Counter, Gauge } from 'prom-client';
import type { Logger, LogProvider } from '../../../logger.js';
import type { IUnleashStores } from '../../../types/stores.js';
import type { IAddonProviders } from '../../../addons/index.js';
import { AUTH_PROVIDERS_CATALOG } from '../../../types/settings/auth-settings.js';

export interface IntegrationMetricsOptions {
    /**
     * How long to cache the result of the configured-integrations DB read.
     * prom-client invokes `collect()` on every scrape; a short cache prevents
     * a fleet of Prometheus replicas from hammering the database.
     */
    cacheTtlMs?: number;
}

export interface IntegrationMetricsHandles {
    /** Counter for auth-login attempts. Increment from the enterprise auth provider. */
    authLoginTotal: Counter<'provider' | 'outcome'>;
}

export interface IntegrationMetricsDeps {
    addonProviders: IAddonProviders;
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>;
    getLogger: LogProvider;
    options?: IntegrationMetricsOptions;
}

const DEFAULT_TTL_MS = 60_000; // 1 minute

/**
 *  metrics show up on `/internal-backstage/prometheus`.
 */
export function registerIntegrationMetrics(
    deps: IntegrationMetricsDeps,
): IntegrationMetricsHandles {
    const { addonProviders, stores, getLogger } = deps;
    const ttlMs = deps.options?.cacheTtlMs ?? DEFAULT_TTL_MS;
    const logger = getLogger('metrics/integrations');

    // expose integrations this Unleash server knows about,
    // how it is configured today, and whether each is deprecated.
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
 *  catalog of available integrations into this server. value=1: registered entry.
 */
function registerAvailableGauge(addonProviders: IAddonProviders): void {
    const gauge = new Gauge({
        name: 'integration_available',
        help: 'Integrations registered with this Unleash server. value=1 means the integration is compiled in and selectable.',
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

    for (const provider of AUTH_PROVIDERS_CATALOG) {
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
 *  catalog of gauge marking deprecated integrations. value=1: entry.
 *  It can be used for alerts like
 *  `integration_configured{state="enabled"} * on(name, kind)
 *      group_left integration_deprecated_info > 0`.
 */
function registerDeprecatedInfoGauge(addonProviders: IAddonProviders): void {
    const gauge = new Gauge({
        name: 'integration_deprecated_info',
        help: 'Marks integrations as deprecated. value=1 always; absence of a series means not deprecated. Use as a join target in alert rules.',
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

    for (const provider of AUTH_PROVIDERS_CATALOG) {
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
 *  current configured instance count per integration and state (`enabled`/`disabled` for
 *  addons; plus `not_configured` for auth providers that have never been saved).
 *  Lazily evaluated via prom-client `collect()`, TTL-cached.
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
        help: 'Integration configurations on this Unleash server, broken out by state. Sampled lazily on scrape with a short TTL cache.',
        labelNames: ['name', 'kind', 'state'] as const,
        async collect() {
            const now = Date.now();
            const fresh = now - cache.ts < ttlMs && cache.samples.length > 0;

            if (!fresh) {
                try {
                    cache.samples = await collectConfiguredSamples(stores);
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
): Promise<ConfiguredSample[]> {
    const samples: ConfiguredSample[] = [];

    const addons = await stores.addonStore.getAll();
    const addonBuckets = new Map<
        string,
        { enabled: number; disabled: number }
    >();

    for (const a of addons) {
        const bucket = addonBuckets.get(a.provider) ?? {
            // so dashboards have a "no enabled instances" mark
            enabled: 0,
            disabled: 0,
        };
        if (a.enabled) bucket.enabled++;
        else {
            bucket.disabled++;
        }
        addonBuckets.set(a.provider, bucket);
    }

    for (const [provider, bucket] of addonBuckets) {
        samples.push({
            name: provider,
            kind: 'addon',
            state: 'enabled',
            count: bucket.enabled,
        });
        samples.push({
            name: provider,
            kind: 'addon',
            state: 'disabled',
            count: bucket.disabled,
        });
    }

    for (const provider of AUTH_PROVIDERS_CATALOG) {
        let row: { enabled?: boolean } | undefined;
        try {
            row = await stores.settingStore.get<{ enabled?: boolean }>(
                provider.configId,
            );
        } catch {
            continue; // skip - connection issues, not emit misleading state
        }

        if (row === undefined) {
            samples.push({
                name: provider.name,
                kind: 'auth',
                state: 'not_configured', // so it can show "this integration hasn't been configured"
                count: 1,
            });
        } else {
            samples.push({
                name: provider.name,
                kind: 'auth',
                state: row.enabled ? 'enabled' : 'disabled', // so it can show "configured but disabled"
                count: 1,
            });
        }
    }

    return samples;
}
