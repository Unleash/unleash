import client from 'prom-client';
import EventEmitter from 'events';
import { Knex } from 'knex';
import * as events from './metric-events';
import {
    DB_POOL_UPDATE,
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_REVIVED,
    FEATURE_STRATEGY_ADD,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_VARIANTS_UPDATED,
    FEATURE_METADATA_UPDATED,
    FEATURE_UPDATED,
    CLIENT_METRICS,
    CLIENT_REGISTER,
} from './types/events';
import { IUnleashConfig } from './types/option';
import { IUnleashStores } from './types/stores';
import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';
import Timer = NodeJS.Timer;
import { InstanceStatsService } from './features/instance-stats/instance-stats-service';
import { ValidatedClientMetrics } from './services/client-metrics/schema';

export default class MetricsMonitor {
    timer?: Timer;

    poolMetricsTimer?: Timer;

    constructor() {
        this.timer = null;
        this.poolMetricsTimer = null;
    }

    startMonitoring(
        config: IUnleashConfig,
        stores: IUnleashStores,
        version: string,
        eventBus: EventEmitter,
        instanceStatsService: InstanceStatsService,
        db: Knex,
    ): Promise<void> {
        if (!config.server.serverMetrics) {
            return;
        }

        const { eventStore } = stores;

        client.collectDefaultMetrics();

        const requestDuration = new client.Summary({
            name: 'http_request_duration_milliseconds',
            help: 'App response time',
            labelNames: ['path', 'method', 'status', 'appName'],
            percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
            maxAgeSeconds: 600,
            ageBuckets: 5,
        });
        const dbDuration = new client.Summary({
            name: 'db_query_duration_seconds',
            help: 'DB query duration time',
            labelNames: ['store', 'action'],
            percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
            maxAgeSeconds: 600,
            ageBuckets: 5,
        });
        const featureToggleUpdateTotal = new client.Counter({
            name: 'feature_toggle_update_total',
            help: 'Number of times a toggle has been updated. Environment label would be "n/a" when it is not available, e.g. when a feature toggle is created.',
            labelNames: ['toggle', 'project', 'environment'],
        });
        const featureToggleUsageTotal = new client.Counter({
            name: 'feature_toggle_usage_total',
            help: 'Number of times a feature toggle has been used',
            labelNames: ['toggle', 'active', 'appName'],
        });
        const featureTogglesTotal = new client.Gauge({
            name: 'feature_toggles_total',
            help: 'Number of feature toggles',
            labelNames: ['version'],
        });
        const usersTotal = new client.Gauge({
            name: 'users_total',
            help: 'Number of users',
        });
        const usersActive7days = new client.Gauge({
            name: 'users_active_7',
            help: 'Number of users active in the last 7 days',
        });
        const usersActive30days = new client.Gauge({
            name: 'users_active_30',
            help: 'Number of users active in the last 30 days',
        });
        const usersActive60days = new client.Gauge({
            name: 'users_active_60',
            help: 'Number of users active in the last 60 days',
        });
        const usersActive90days = new client.Gauge({
            name: 'users_active_90',
            help: 'Number of users active in the last 90 days',
        });
        const projectsTotal = new client.Gauge({
            name: 'projects_total',
            help: 'Number of projects',
            labelNames: ['mode'],
        });
        const environmentsTotal = new client.Gauge({
            name: 'environments_total',
            help: 'Number of environments',
        });
        const groupsTotal = new client.Gauge({
            name: 'groups_total',
            help: 'Number of groups',
        });

        const rolesTotal = new client.Gauge({
            name: 'roles_total',
            help: 'Number of roles',
        });

        const customRootRolesTotal = new client.Gauge({
            name: 'custom_root_roles_total',
            help: 'Number of custom root roles',
        });

        const customRootRolesInUseTotal = new client.Gauge({
            name: 'custom_root_roles_in_use_total',
            help: 'Number of custom root roles in use',
        });

        const segmentsTotal = new client.Gauge({
            name: 'segments_total',
            help: 'Number of segments',
        });

        const contextTotal = new client.Gauge({
            name: 'context_total',
            help: 'Number of context',
        });

        const strategiesTotal = new client.Gauge({
            name: 'strategies_total',
            help: 'Number of strategies',
        });

        const clientAppsTotal = new client.Gauge({
            name: 'client_apps_total',
            help: 'Number of registered client apps aggregated by range by last seen',
            labelNames: ['range'],
        });

        const samlEnabled = new client.Gauge({
            name: 'saml_enabled',
            help: 'Whether SAML is enabled',
        });

        const oidcEnabled = new client.Gauge({
            name: 'oidc_enabled',
            help: 'Whether OIDC is enabled',
        });

        const clientSdkVersionUsage = new client.Counter({
            name: 'client_sdk_versions',
            help: 'Which sdk versions are being used',
            labelNames: ['sdk_name', 'sdk_version'],
        });

        const optimal304DiffingCounter = new client.Counter({
            name: 'optimal_304_diffing',
            help: 'Count the Optimal 304 diffing with status',
            labelNames: ['status'],
        });

        const productionChanges30 = new client.Gauge({
            name: 'production_changes_30',
            help: 'Changes made to production environment last 30 days',
            labelNames: ['environment'],
        });
        const productionChanges60 = new client.Gauge({
            name: 'production_changes_60',
            help: 'Changes made to production environment last 60 days',
            labelNames: ['environment'],
        });
        const productionChanges90 = new client.Gauge({
            name: 'production_changes_90',
            help: 'Changes made to production environment last 90 days',
            labelNames: ['environment'],
        });

        const rateLimits = new client.Gauge({
            name: 'rate_limits',
            help: 'Rate limits (per minute) for METHOD/ENDPOINT pairs',
            labelNames: ['endpoint', 'method'],
        });

        async function collectStaticCounters() {
            try {
                const stats = await instanceStatsService.getStats();

                featureTogglesTotal.reset();
                featureTogglesTotal.labels(version).set(stats.featureToggles);

                usersTotal.reset();
                usersTotal.set(stats.users);

                usersActive7days.reset();
                usersActive7days.set(stats.activeUsers.last7);
                usersActive30days.reset();
                usersActive30days.set(stats.activeUsers.last30);
                usersActive60days.reset();
                usersActive60days.set(stats.activeUsers.last60);
                usersActive90days.reset();
                usersActive90days.set(stats.activeUsers.last90);

                productionChanges30.reset();
                productionChanges30.set(stats.productionChanges.last30);
                productionChanges60.reset();
                productionChanges60.set(stats.productionChanges.last60);
                productionChanges90.reset();
                productionChanges90.set(stats.productionChanges.last90);

                projectsTotal.reset();
                stats.projects.forEach((projectStat) => {
                    projectsTotal
                        .labels({ mode: projectStat.mode })
                        .set(projectStat.count);
                });

                environmentsTotal.reset();
                environmentsTotal.set(stats.environments);

                groupsTotal.reset();
                groupsTotal.set(stats.groups);

                rolesTotal.reset();
                rolesTotal.set(stats.roles);

                customRootRolesTotal.reset();
                customRootRolesTotal.set(stats.customRootRoles);

                customRootRolesInUseTotal.reset();
                customRootRolesInUseTotal.set(stats.customRootRolesInUse);

                segmentsTotal.reset();
                segmentsTotal.set(stats.segments);

                contextTotal.reset();
                contextTotal.set(stats.contextFields);

                strategiesTotal.reset();
                strategiesTotal.set(stats.strategies);

                samlEnabled.reset();
                samlEnabled.set(stats.SAMLenabled ? 1 : 0);

                oidcEnabled.reset();
                oidcEnabled.set(stats.OIDCenabled ? 1 : 0);

                clientAppsTotal.reset();
                stats.clientApps.forEach((clientStat) =>
                    clientAppsTotal
                        .labels({ range: clientStat.range })
                        .set(clientStat.count),
                );

                rateLimits.reset();
                rateLimits
                    .labels('/api/client/metrics', 'POST')
                    .set(config.metricsRateLimiting.clientMetricsMaxPerMinute);
                rateLimits
                    .labels('/api/client/register', 'POST')
                    .set(config.metricsRateLimiting.clientRegisterMaxPerMinute);
                rateLimits
                    .labels('/api/frontend/metrics', 'POST')
                    .set(
                        config.metricsRateLimiting.frontendMetricsMaxPerMinute,
                    );
                rateLimits
                    .labels('/api/frontend/register', 'POST')
                    .set(
                        config.metricsRateLimiting.frontendRegisterMaxPerMinute,
                    );
                rateLimits
                    .labels('/api/admin/user-admin', 'POST')
                    .set(config.rateLimiting.createUserMaxPerMinute);
                rateLimits
                    .labels('/auth/simple', 'POST')
                    .set(config.rateLimiting.simpleLoginMaxPerMinute);
            } catch (e) {}
        }

        process.nextTick(() => {
            collectStaticCounters();
            this.timer = setInterval(
                () => collectStaticCounters(),
                hoursToMilliseconds(2),
            ).unref();
        });

        eventBus.on(
            events.REQUEST_TIME,
            ({ path, method, time, statusCode, appName }) => {
                requestDuration
                    .labels(path, method, statusCode, appName)
                    .observe(time);
            },
        );

        eventBus.on('optimal304Differ', ({ status }) => {
            optimal304DiffingCounter.labels(status).inc();
        });

        eventBus.on(events.DB_TIME, ({ store, action, time }) => {
            dbDuration.labels(store, action).observe(time);
        });

        eventStore.on(FEATURE_CREATED, ({ featureName, project }) => {
            featureToggleUpdateTotal.labels(featureName, project, 'n/a').inc();
        });
        eventStore.on(FEATURE_VARIANTS_UPDATED, ({ featureName, project }) => {
            featureToggleUpdateTotal.labels(featureName, project, 'n/a').inc();
        });
        eventStore.on(FEATURE_METADATA_UPDATED, ({ featureName, project }) => {
            featureToggleUpdateTotal.labels(featureName, project, 'n/a').inc();
        });
        eventStore.on(FEATURE_UPDATED, ({ featureName, project }) => {
            featureToggleUpdateTotal
                .labels(featureName, project, 'default')
                .inc();
        });
        eventStore.on(
            FEATURE_STRATEGY_ADD,
            ({ featureName, project, environment }) => {
                featureToggleUpdateTotal
                    .labels(featureName, project, environment)
                    .inc();
            },
        );
        eventStore.on(
            FEATURE_STRATEGY_REMOVE,
            ({ featureName, project, environment }) => {
                featureToggleUpdateTotal
                    .labels(featureName, project, environment)
                    .inc();
            },
        );
        eventStore.on(
            FEATURE_STRATEGY_UPDATE,
            ({ featureName, project, environment }) => {
                featureToggleUpdateTotal
                    .labels(featureName, project, environment)
                    .inc();
            },
        );
        eventStore.on(
            FEATURE_ENVIRONMENT_DISABLED,
            ({ featureName, project, environment }) => {
                featureToggleUpdateTotal
                    .labels(featureName, project, environment)
                    .inc();
            },
        );
        eventStore.on(
            FEATURE_ENVIRONMENT_ENABLED,
            ({ featureName, project, environment }) => {
                featureToggleUpdateTotal
                    .labels(featureName, project, environment)
                    .inc();
            },
        );
        eventStore.on(FEATURE_ARCHIVED, ({ featureName, project }) => {
            featureToggleUpdateTotal.labels(featureName, project, 'n/a').inc();
        });
        eventStore.on(FEATURE_REVIVED, ({ featureName, project }) => {
            featureToggleUpdateTotal.labels(featureName, project, 'n/a').inc();
        });

        eventBus.on(CLIENT_METRICS, (m: ValidatedClientMetrics) => {
            for (const entry of Object.entries(m.bucket.toggles)) {
                featureToggleUsageTotal
                    .labels(entry[0], 'true', m.appName)
                    .inc(entry[1].yes);
                featureToggleUsageTotal
                    .labels(entry[0], 'false', m.appName)
                    .inc(entry[1].no);
            }
        });
        eventStore.on(CLIENT_REGISTER, (m) => {
            if (m.sdkVersion && m.sdkVersion.indexOf(':') > -1) {
                const [sdkName, sdkVersion] = m.sdkVersion.split(':');
                clientSdkVersionUsage.labels(sdkName, sdkVersion).inc();
            }
        });

        this.configureDbMetrics(db, eventBus);
    }

    stopMonitoring(): void {
        clearInterval(this.timer);
        clearInterval(this.poolMetricsTimer);
    }

    configureDbMetrics(db: Knex, eventBus: EventEmitter): void {
        if (db?.client) {
            const dbPoolMin = new client.Gauge({
                name: 'db_pool_min',
                help: 'Minimum DB pool size',
            });
            dbPoolMin.set(db.client.pool.min);
            const dbPoolMax = new client.Gauge({
                name: 'db_pool_max',
                help: 'Maximum DB pool size',
            });
            dbPoolMax.set(db.client.pool.max);
            const dbPoolFree = new client.Gauge({
                name: 'db_pool_free',
                help: 'Current free connections in DB pool',
            });
            const dbPoolUsed = new client.Gauge({
                name: 'db_pool_used',
                help: 'Current connections in use in DB pool',
            });
            const dbPoolPendingCreates = new client.Gauge({
                name: 'db_pool_pending_creates',
                help: 'how many asynchronous create calls are running in DB pool',
            });
            const dbPoolPendingAcquires = new client.Gauge({
                name: 'db_pool_pending_acquires',
                help: 'how many acquires are waiting for a resource to be released in DB pool',
            });

            eventBus.on(DB_POOL_UPDATE, (data) => {
                dbPoolFree.set(data.free);
                dbPoolUsed.set(data.used);
                dbPoolPendingCreates.set(data.pendingCreates);
                dbPoolPendingAcquires.set(data.pendingAcquires);
            });

            this.registerPoolMetrics(db.client.pool, eventBus);
            this.poolMetricsTimer = setInterval(
                () => this.registerPoolMetrics(db.client.pool, eventBus),
                minutesToMilliseconds(1),
            );
            this.poolMetricsTimer.unref();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    registerPoolMetrics(pool: any, eventBus: EventEmitter) {
        try {
            eventBus.emit(DB_POOL_UPDATE, {
                used: pool.numUsed(),
                free: pool.numFree(),
                pendingCreates: pool.numPendingCreates(),
                pendingAcquires: pool.numPendingAcquires(),
            });
            // eslint-disable-next-line no-empty
        } catch (e) {}
    }
}
export function createMetricsMonitor(): MetricsMonitor {
    return new MetricsMonitor();
}

module.exports = {
    createMetricsMonitor,
};
