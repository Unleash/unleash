import type EventEmitter from 'events';
import type { Logger } from '../../../logger.js';
import type { IUnleashConfig } from '../../../types/option.js';
import type { IUnleashStores } from '../../../types/stores.js';
import { getAddons, type IAddonProviders } from '../../../addons/index.js';
import { AUTH_PROVIDERS_CATALOG } from '../../../types/settings/auth-settings.js';
import type { IAddon } from '../../../types/stores/addon-store.js';
import { AUTH_LOGIN_COMPLETED } from '../../../metric-events.js';
import {
    createCounter,
    createGauge,
    type Gauge,
    type GaugeSample,
} from '../../../util/metrics/index.js';

const DEFAULT_TTL_MS = 60_000; // 1 minute

interface IntegrationMetricsOptions {
    cacheTtlMs?: number;
}

interface IntegrationMetricsDeps {
    addonProviders?: IAddonProviders;
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>;
    config: Pick<IUnleashConfig, 'getLogger' | 'server' | 'flagResolver'>;
    options?: IntegrationMetricsOptions;
    eventBus: EventEmitter;
}

type ConfiguredLabels = 'name' | 'kind' | 'state';
type AvailableLabels = 'name' | 'kind' | 'deprecated' | 'removal_target';

interface ConfiguredSample {
    name: string;
    kind: 'addon' | 'auth';
    state: 'enabled' | 'disabled' | 'not_configured';
    count: number;
}

/**
 *  metrics show up on `/internal-backstage/prometheus`.
 */
export function registerIntegrationMetrics(deps: IntegrationMetricsDeps): void {
    const { config, stores, eventBus } = deps;
    const logger = config.getLogger('metrics/integrations');

    // prom-client invokes `collect()` on every call; this short cache prevents
    // lots of Prometheus replicas from hitting the database
    const ttlMs = deps.options?.cacheTtlMs ?? DEFAULT_TTL_MS;

    // Get the Addon catalog. Used for tests - production always derives it.
    const addonProviders =
        deps.addonProviders ??
        getAddons({
            getLogger: config.getLogger,
            unleashUrl: config.server.unleashUrl,
            flagResolver: config.flagResolver,
            eventBus,
        } as Parameters<typeof getAddons>[0]);

    registerAvailableGauge(addonProviders);
    registerConfiguredGauge({ stores, ttlMs, logger });

    const authLoginTotal = createCounter({
        name: 'auth_login_total',
        help: 'Authentication attempts by provider per outcome.',
        labelNames: ['provider', 'outcome'] as const,
    });

    eventBus.on(
        AUTH_LOGIN_COMPLETED,
        (payload: { provider: string; outcome: 'success' | 'failure' }) => {
            authLoginTotal.increment({
                provider: payload.provider,
                outcome: payload.outcome,
            });
        },
    );
}

function registerAddons(
    gauge: Gauge<AvailableLabels>,
    addonProviders: IAddonProviders,
): void {
    if (!gauge) {
        throw new Error('Gauge must not be null');
    }

    for (const addon of Object.values(addonProviders)) {
        const { name, deprecated } = addon.definition;

        gauge
            .labels({
                name,
                kind: 'addon',
                deprecated: String(Boolean(deprecated)),
                removal_target: deprecated ?? '',
            })
            .set(1);
    }
}

function registerAuthProviders(gauge: Gauge<AvailableLabels>): void {
    if (!gauge) {
        throw new Error('Gauge must not be null');
    }

    for (const provider of Object.values(AUTH_PROVIDERS_CATALOG)) {
        const { name, deprecatedRemovalTarget } = provider;

        gauge
            .labels({
                name,
                kind: 'auth',
                deprecated: String(Boolean(deprecatedRemovalTarget)),
                removal_target: deprecatedRemovalTarget ?? '',
            })
            .set(1);
    }
}

/**
 *  `integration_available{name, kind, deprecated, removal_target}`
 *
 *  all available integrations of this server. value=1: registered entry.
 *  removal_target: set only if deprecated, empty string otherwise.
 */
function registerAvailableGauge(addonProviders: IAddonProviders): void {
    const gauge = createGauge<AvailableLabels>({
        name: 'integration_available',
        help: 'Available integrations with this Unleash server. removal_target set if deprecated.',
        labelNames: ['name', 'kind', 'deprecated', 'removal_target'] as const,
    });

    registerAddons(gauge, addonProviders);
    registerAuthProviders(gauge);
}

/**
 * `integration_configured{name, kind, state}`
 *
 *  lists configured instances per integration and state (`enabled`/`disabled`)
 *  plus `not_configured` for auth providers that have never been saved.
 *
 *  Uses createGauge's `fetchSamples` mode — the wrapper owns the TTL cache,
 *  the stale-on-error fallback, and the per-scrape reset. The fetcher here
 *  is a pure function from store reads → labelled samples.
 */
function registerConfiguredGauge(args: {
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>;
    ttlMs: number;
    logger: Logger;
}): void {
    const { stores, ttlMs, logger } = args;

    createGauge<ConfiguredLabels>({
        name: 'integration_configured',
        help: 'Configured integrations on this Unleash server, per state.',
        labelNames: ['name', 'kind', 'state'] as const,
        ttlMs,
        fetchSamples: async (): Promise<GaugeSample<ConfiguredLabels>[]> => {
            const samples = await collectConfiguredSamples(stores, logger);
            return samples.map((s) => ({
                labels: { name: s.name, kind: s.kind, state: s.state },
                value: s.count,
            }));
        },
    });
}

export async function collectConfiguredSamples(
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>,
    logger?: Logger,
): Promise<ConfiguredSample[]> {
    // Addons
    const addons = await stores.addonStore.getAll();
    const addonBuckets = collectAddonSamples(addons);

    // Only push if count > 0 to avoid empty entries
    const samples = bucketAddonsByState(addonBuckets);

    // Auth providers
    const authResults = await collectAuthSamples(stores, logger);

    samples.push(...authResults);

    return samples;
}

async function collectAuthSamples(
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>,
    logger: Logger | undefined,
) {
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

    return validAuthSamples;
}

function bucketAddonsByState(
    addonBuckets: Map<string, { enabled: number; disabled: number }>,
): ConfiguredSample[] {
    const samples: ConfiguredSample[] = [];

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

    return samples;
}

function collectAddonSamples(addons: IAddon[]) {
    const addonBuckets = new Map<
        string,
        { enabled: number; disabled: number }
    >();

    for (const addon of addons) {
        const bucket = {
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

    return addonBuckets;
}
