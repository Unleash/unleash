import type EventEmitter from 'events';
import type { Logger } from '../../../logger.js';
import type { IUnleashConfig } from '../../../types/option.js';
import type { IUnleashStores } from '../../../types/stores.js';
import { getAddons, type IAddonProviders } from '../../../addons/index.js';
import { AUTH_PROVIDERS_CATALOG } from '../../../types/settings/auth-settings.js';
import { AUTH_LOGIN_COMPLETED } from '../../../metric-events.js';
import { createCounter } from '../../../util/metrics/index.js';
import type { DbMetricsMonitor } from '../../../metrics-gauge.js';

interface IntegrationMetricsSetupOpts {
    config: Pick<IUnleashConfig, 'getLogger' | 'server' | 'flagResolver'>;
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>;
    eventBus: EventEmitter;
    dbMetrics: DbMetricsMonitor;
}

interface IntegrationMetricsDeps extends IntegrationMetricsSetupOpts {
    addonProviders: IAddonProviders;
}

interface AvailableIntegration {
    name: string;
    kind: 'addon' | 'auth';
    deprecated: string;
    removal_target: string;
}

interface ConfiguredIntegration {
    name: string;
    kind: 'addon' | 'auth';
    state: 'enabled' | 'disabled' | 'not_configured';
    count: number;
}

export function setupIntegrationMetrics(
    opts: IntegrationMetricsSetupOpts,
): void {
    const addonProviders = getAddons({
        getLogger: opts.config.getLogger,
        unleashUrl: opts.config.server.unleashUrl,
        flagResolver: opts.config.flagResolver,
        eventBus: opts.eventBus,
    } as Parameters<typeof getAddons>[0]);

    registerIntegrationMetrics({ ...opts, addonProviders });
}

export function registerIntegrationMetrics({
    config,
    stores,
    eventBus,
    dbMetrics,
    addonProviders,
}: IntegrationMetricsDeps): void {
    const logger = config.getLogger('metrics/integrations');

    registerGaugeWithParams({
        dbMetrics,
        name: 'integration_available',
        help: 'Available integrations with this Unleash server. removal_target set if deprecated.',
        labelNames: ['name', 'kind', 'deprecated', 'removal_target'] as const,
        query: async () => collectAvailableIntegrations(addonProviders),
        mapMetric: (s: AvailableIntegration) => ({
            value: 1,
            labels: {
                name: s.name,
                kind: s.kind,
                deprecated: s.deprecated,
                removal_target: s.removal_target,
            },
        }),
    });

    registerGaugeWithParams({
        dbMetrics,
        name: 'integration_configured',
        help: 'Configured integrations on this Unleash server, per state.',
        labelNames: ['name', 'kind', 'state'] as const,
        query: () => collectConfiguredIntegrations(stores, logger),
        mapMetric: (s: ConfiguredIntegration) => ({
            value: s.count,
            labels: { name: s.name, kind: s.kind, state: s.state },
        }),
    });

    registerAuthLoginTotalCounter(eventBus);
}

function registerGaugeWithParams<T extends { name: string; kind: string }>({
    dbMetrics,
    name,
    help,
    labelNames,
    query,
    mapMetric,
}: {
    dbMetrics: DbMetricsMonitor;
    name: string;
    help: string;
    labelNames: readonly string[];
    query: () => Promise<T[]>;
    mapMetric: (m: T) => { value: number; labels: Record<string, string> };
}): void {
    dbMetrics.registerGaugeDbMetric({
        name,
        help,
        labelNames: labelNames as string[],
        query,
        map: (metrics) => metrics.map(mapMetric),
    });
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

function collectAvailableIntegrations(
    addonProviders: IAddonProviders,
): AvailableIntegration[] {
    const addons = Object.values(addonProviders).map(
        ({ definition: { name, deprecated } }) => ({
            name,
            kind: 'addon' as const,
            deprecated: String(Boolean(deprecated)),
            removal_target: typeof deprecated === 'string' ? deprecated : '',
        }),
    );

    const authProviders = Object.values(AUTH_PROVIDERS_CATALOG).map(
        ({ name, deprecatedRemovalTarget }) => ({
            name,
            kind: 'auth' as const,
            deprecated: String(Boolean(deprecatedRemovalTarget)),
            removal_target: deprecatedRemovalTarget ?? '',
        }),
    );

    return [...addons, ...authProviders];
}

export async function collectConfiguredIntegrations(
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>,
    logger?: Logger,
): Promise<ConfiguredIntegration[]> {
    const addons = await stores.addonStore.getAll();

    const addonBuckets = Object.entries(
        addons.reduce<Record<string, { enabled: number; disabled: number }>>(
            (acc, addon) => {
                const bucket = acc[addon.provider] ?? {
                    enabled: 0,
                    disabled: 0,
                };
                acc[addon.provider] = bucket;

                if (addon.enabled) {
                    bucket.enabled++;
                } else {
                    bucket.disabled++;
                }
                return acc;
            },
            {},
        ),
    ).flatMap(([provider, { enabled, disabled }]) => [
        ...(enabled > 0
            ? [
                  {
                      name: provider,
                      kind: 'addon' as const,
                      state: 'enabled' as const,
                      count: enabled,
                  },
              ]
            : []),
        ...(disabled > 0
            ? [
                  {
                      name: provider,
                      kind: 'addon' as const,
                      state: 'disabled' as const,
                      count: disabled,
                  },
              ]
            : []),
    ]);

    const authBuckets = (
        await Promise.all(
            Object.values(AUTH_PROVIDERS_CATALOG).map(async (provider) => {
                try {
                    const row = await stores.settingStore.get<{
                        enabled?: boolean;
                    }>(provider.configId);
                    const state: ConfiguredIntegration['state'] = row
                        ? row.enabled
                            ? 'enabled'
                            : 'disabled'
                        : 'not_configured';
                    return {
                        name: provider.name,
                        kind: 'auth' as const,
                        state,
                        count: 1,
                    } satisfies ConfiguredIntegration;
                } catch (error) {
                    logger?.warn(
                        `Failed to fetch auth config for ${provider.name}`,
                        { error },
                    );
                    return null;
                }
            }),
        )
    ).filter((r) => r !== null);

    return [...addonBuckets, ...authBuckets];
}
