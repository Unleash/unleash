import type EventEmitter from 'events';
import type { Logger } from '../../../logger.js';
import type { IUnleashConfig } from '../../../types/option.js';
import type { IUnleashStores } from '../../../types/stores.js';
import { getAddons, type IAddonProviders } from '../../../addons/index.js';
import {
    AUTH_PROVIDERS_CATALOG,
    type AuthProviderConfig,
} from '../../../types/settings/auth-settings.js';
import { AUTH_LOGIN_COMPLETED } from '../../../metric-events.js';
import { createCounter } from '../../../util/metrics/index.js';
import type { DbMetricsMonitor } from '../../../metrics-gauge.js';

interface IntegrationMetricsSetupOpts {
    config: Pick<
        IUnleashConfig,
        | 'getLogger'
        | 'server'
        | 'flagResolver'
        | 'allowPrivateUrlInIntegration'
        | 'allowListIntegration'
    >;
    stores: Pick<IUnleashStores, 'addonStore' | 'settingStore'>;
    eventBus: EventEmitter;
    dbMetrics: DbMetricsMonitor;
}

interface IntegrationMetricsDeps extends IntegrationMetricsSetupOpts {
    addonProviders: IAddonProviders;
}

interface AvailableIntegration {
    name: string;
    deprecated: string;
    removal_target: string;
}

interface ConfiguredIntegration {
    name: string;
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
        allowPrivateUrls: opts.config.allowPrivateUrlInIntegration,
        allowList: opts.config.allowListIntegration,
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
        labelNames: ['name', 'deprecated', 'removal_target'] as const,
        query: async () => collectAvailableIntegrations(addonProviders),
        mapMetric: (s: AvailableIntegration) => ({
            value: 1,
            labels: {
                name: s.name,
                deprecated: s.deprecated,
                removal_target: s.removal_target,
            },
        }),
    });

    registerGaugeWithParams({
        dbMetrics,
        name: 'integration_configured',
        help: 'Configured integrations on this Unleash server, per state.',
        labelNames: ['name', 'state'] as const,
        query: () => collectConfiguredIntegrations(stores, logger),
        mapMetric: (s: ConfiguredIntegration) => ({
            value: s.count,
            labels: { name: s.name, state: s.state },
        }),
    });

    registerAuthLoginTotalCounter(eventBus);
}

function registerGaugeWithParams<T extends { name: string }>({
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
            deprecated: String(Boolean(deprecated)),
            removal_target: typeof deprecated === 'string' ? deprecated : '',
        }),
    );

    const authProviders = Object.values(AUTH_PROVIDERS_CATALOG).map(
        ({ name, deprecatedRemovalTarget }) => ({
            name,
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

    const addonBuckets: Array<{
        name: string;
        state: 'enabled' | 'disabled';
        count: number;
    }> = [];
    addons.forEach((addon) => {
        const enabled = addons.filter(
            (a) => a.provider === addon.provider && a.enabled,
        ).length;
        const disabled = addons.filter(
            (a) => a.provider === addon.provider && !a.enabled,
        ).length;

        if (enabled > 0)
            addonBuckets.push({
                name: addon.provider,
                state: 'enabled',
                count: enabled,
            });
        if (disabled > 0)
            addonBuckets.push({
                name: addon.provider,
                state: 'disabled',
                count: disabled,
            });
    });

    const authBuckets = (
        await Promise.all(
            Object.values(AUTH_PROVIDERS_CATALOG).map(async (provider) => {
                try {
                    const row = await stores.settingStore.get<{
                        enabled?: boolean;
                        disabled?: boolean;
                    }>(provider.configId);

                    return {
                        name: provider.name,
                        state: resolveAuthState(provider, row),
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

/**
 * The providers in Unleash have two interpretations:
 *   - `default === 'enabled'` (e.g. `simple`)
 *     row stores `{disabled: boolean}`. If no config row, means addon enabled
 *     the row only exists once user turns it off (disabled: true).
 *   - `default === 'disabled'` (e.g. oidc, saml, google) —
 *     row stores `{enabled: boolean}`. If no config row, means not_configured
 *     so that dashboards show "nobody ever set this up".
 */
function resolveAuthState(
    provider: AuthProviderConfig,
    row: { enabled?: boolean; disabled?: boolean } | undefined,
): ConfiguredIntegration['state'] {
    if (provider.default === 'enabled') {
        // e.g. in 'simple' auth, default is enabled, with no config
        // otherwise stored field is `disabled`;
        if (row === undefined) return 'enabled';
        return row.disabled ? 'disabled' : 'enabled';
    }

    // Standard convention, no row means not_configured.
    if (row === undefined) return 'not_configured';
    return row.enabled ? 'enabled' : 'disabled';
}
