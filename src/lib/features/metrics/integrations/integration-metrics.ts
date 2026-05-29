import type EventEmitter from 'events';
import type { Logger } from '../../../logger.js';
import type { IUnleashConfig } from '../../../types/option.js';
import type { IUnleashStores } from '../../../types/stores.js';
import { getAddons, type IAddonProviders } from '../../../addons/index.js';
import { AUTH_PROVIDERS_CATALOG } from '../../../types/settings/auth-settings.js';
import type { IAddon } from '../../../types/stores/addon-store.js';
import { AUTH_LOGIN_COMPLETED } from '../../../metric-events.js';
import { createCounter } from '../../../util/metrics/index.js';
import type { DbMetricsMonitor } from '../../../metrics-gauge.js';

interface IntegrationMetricsDeps {
    config: Pick<IUnleashConfig, 'getLogger' | 'server' | 'flagResolver'>;
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>;
    eventBus: EventEmitter;
    dbMetrics: DbMetricsMonitor;
    addonProviders?: IAddonProviders; // only for testing
}

/**
 * row of the `integration_available` gauge
 */
interface AvailableIntegrationMetric {
    name: string;
    kind: 'addon' | 'auth';
    deprecated: string;
    removal_target: string;
}

/**
 * row of the `integration_configured` gauge
 */
interface ConfiguredIntegrationMetric {
    name: string;
    kind: 'addon' | 'auth';
    state: 'enabled' | 'disabled' | 'not_configured';
    count: number;
}

export function registerIntegrationMetrics(deps: IntegrationMetricsDeps): void {
    const { config, stores, eventBus, dbMetrics } = deps;
    const logger = config.getLogger('metrics/integrations');

    const addonProviders =
        deps.addonProviders ??
        getAddons({
            getLogger: config.getLogger,
            unleashUrl: config.server.unleashUrl,
            flagResolver: config.flagResolver,
            eventBus,
        } as Parameters<typeof getAddons>[0]);

    registerAvailableGauge({ dbMetrics, addonProviders });
    registerConfiguredGauge({ dbMetrics, stores, logger });

    registerAuthLoginTotalCounter(eventBus);
}

function registerAuthLoginTotalCounter(eventBus: EventEmitter): void {
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

/**
 * `integration_available{name, kind, deprecated, removal_target}`
 *
 * All available integrations (addons + auth providers). value=1 per entry.
 * `removal_target` is empty if not deprecated.
 */
function registerAvailableGauge(args: {
    dbMetrics: DbMetricsMonitor;
    addonProviders: IAddonProviders;
}): void {
    const { dbMetrics, addonProviders } = args;

    dbMetrics.registerGaugeDbMetric({
        name: 'integration_available',
        help: 'Available integrations with this Unleash server. removal_target set if deprecated.',
        labelNames: ['name', 'kind', 'deprecated', 'removal_target'] as const,
        query: async () => collectAvailableSamples(addonProviders),
        map: (samples) =>
            samples.map((s) => ({
                value: 1,
                labels: {
                    name: s.name,
                    kind: s.kind,
                    deprecated: s.deprecated,
                    removal_target: s.removal_target,
                },
            })),
    });
}

/**
 * `integration_configured{name, kind, state}`
 *
 * Configured addons and auth providers.
 * For addons: `enabled`/`disabled`.
 * For auth providers: `enabled`/`disabled`/ `not_configured` ( when no settings).
 */
function registerConfiguredGauge(args: {
    dbMetrics: DbMetricsMonitor;
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>;
    logger: Logger;
}): void {
    const { dbMetrics, stores, logger } = args;

    dbMetrics.registerGaugeDbMetric({
        name: 'integration_configured',
        help: 'Configured integrations on this Unleash server, per state.',
        labelNames: ['name', 'kind', 'state'] as const,
        query: () => collectConfiguredSamples(stores, logger),
        map: (samples) =>
            samples.map((s) => ({
                value: s.count,
                labels: { name: s.name, kind: s.kind, state: s.state },
            })),
    });
}

export function collectAvailableSamples(
    addonProviders: IAddonProviders,
): AvailableIntegrationMetric[] {
    const samples: AvailableIntegrationMetric[] = [];

    for (const addon of Object.values(addonProviders)) {
        const { name, deprecated } = addon.definition;
        samples.push({
            name,
            kind: 'addon',
            deprecated: String(Boolean(deprecated)),
            removal_target: typeof deprecated === 'string' ? deprecated : '',
        });
    }

    for (const provider of Object.values(AUTH_PROVIDERS_CATALOG)) {
        const { name, deprecatedRemovalTarget } = provider;
        samples.push({
            name,
            kind: 'auth',
            deprecated: String(Boolean(deprecatedRemovalTarget)),
            removal_target: deprecatedRemovalTarget ?? '',
        });
    }

    return samples;
}

export async function collectConfiguredSamples(
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>,
    logger?: Logger,
): Promise<ConfiguredIntegrationMetric[]> {
    // Addons — per provider × state.
    const addons = await stores.addonStore.getAll();
    const addonBuckets = bucketAddons(addons);
    const samples = addonBucketsToSamples(addonBuckets);

    // Auth providers — one sample per entry
    const authSamples = await collectAuthSamples(stores, logger);
    samples.push(...authSamples);

    return samples;
}

async function collectAuthSamples(
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>,
    logger: Logger | undefined,
): Promise<ConfiguredIntegrationMetric[]> {
    const results = await Promise.all(
        Object.values(AUTH_PROVIDERS_CATALOG).map(async (provider) => {
            try {
                const row = await stores.settingStore.get<{
                    enabled?: boolean;
                }>(provider.configId);

                const state: ConfiguredIntegrationMetric['state'] = row
                    ? row.enabled
                        ? 'enabled'
                        : 'disabled'
                    : 'not_configured';

                return {
                    name: provider.name,
                    kind: 'auth' as const,
                    state,
                    count: 1,
                } satisfies ConfiguredIntegrationMetric;
            } catch (error) {
                logger?.warn(
                    `Failed to fetch auth config for ${provider.name}`,
                    { error },
                );
                return null;
            }
        }),
    );

    return results.filter((result) => result !== null);
}

function bucketAddons(
    addons: IAddon[],
): Map<string, { enabled: number; disabled: number }> {
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

    return addonBuckets;
}

function addonBucketsToSamples(
    addonBuckets: Map<string, { enabled: number; disabled: number }>,
): ConfiguredIntegrationMetric[] {
    const samples: ConfiguredIntegrationMetric[] = [];

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
