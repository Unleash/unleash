import { collectDefaultMetrics } from 'prom-client';
import memoizee from 'memoizee';
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
import { InstanceStatsService } from './features/instance-stats/instance-stats-service';
import { ValidatedClientMetrics } from './features/metrics/shared/schema';
import { IEnvironment } from './types';
import {
    createCounter,
    createGauge,
    createSummary,
    createHistogram,
} from './util/metrics';
import { SchedulerService } from './services';

export default class MetricsMonitor {
    constructor() {}

    async startMonitoring(
        config: IUnleashConfig,
        stores: IUnleashStores,
        version: string,
        eventBus: EventEmitter,
        instanceStatsService: InstanceStatsService,
        schedulerService: SchedulerService,
        db: Knex,
    ): Promise<void> {
        if (!config.server.serverMetrics) {
            return Promise.resolve();
        }

        const { eventStore, environmentStore } = stores;

        const cachedEnvironments: () => Promise<IEnvironment[]> = memoizee(
            async () => environmentStore.getAll(),
            {
                promise: true,
                maxAge: hoursToMilliseconds(1),
            },
        );

        collectDefaultMetrics();

        const requestDuration = createSummary({
            name: 'http_request_duration_milliseconds',
            help: 'App response time',
            labelNames: ['path', 'method', 'status', 'appName'],
            percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
            maxAgeSeconds: 600,
            ageBuckets: 5,
        });
        const schedulerDuration = createSummary({
            name: 'scheduler_duration_seconds',
            help: 'Scheduler duration time',
            labelNames: ['jobId'],
            percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
            maxAgeSeconds: 600,
            ageBuckets: 5,
        });
        const dbDuration = createSummary({
            name: 'db_query_duration_seconds',
            help: 'DB query duration time',
            labelNames: ['store', 'action'],
            percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
            maxAgeSeconds: 600,
            ageBuckets: 5,
        });
        const featureToggleUpdateTotal = createCounter({
            name: 'feature_toggle_update_total',
            help: 'Number of times a toggle has been updated. Environment label would be "n/a" when it is not available, e.g. when a feature toggle is created.',
            labelNames: ['toggle', 'project', 'environment', 'environmentType'],
        });
        const featureToggleUsageTotal = createCounter({
            name: 'feature_toggle_usage_total',
            help: 'Number of times a feature toggle has been used',
            labelNames: ['toggle', 'active', 'appName'],
        });
        const featureTogglesTotal = createGauge({
            name: 'feature_toggles_total',
            help: 'Number of feature toggles',
            labelNames: ['version'],
        });
        const usersTotal = createGauge({
            name: 'users_total',
            help: 'Number of users',
        });
        const serviceAccounts = createGauge({
            name: 'service_accounts_total',
            help: 'Number of service accounts',
        });
        const apiTokens = createGauge({
            name: 'api_tokens_total',
            help: 'Number of API tokens',
            labelNames: ['type'],
        });
        const enabledMetricsBucketsPreviousDay = createGauge({
            name: 'enabled_metrics_buckets_previous_day',
            help: 'Number of hourly enabled/disabled metric buckets in the previous day',
        });
        const variantMetricsBucketsPreviousDay = createGauge({
            name: 'variant_metrics_buckets_previous_day',
            help: 'Number of hourly variant metric buckets in the previous day',
        });
        const usersActive7days = createGauge({
            name: 'users_active_7',
            help: 'Number of users active in the last 7 days',
        });
        const usersActive30days = createGauge({
            name: 'users_active_30',
            help: 'Number of users active in the last 30 days',
        });
        const usersActive60days = createGauge({
            name: 'users_active_60',
            help: 'Number of users active in the last 60 days',
        });
        const usersActive90days = createGauge({
            name: 'users_active_90',
            help: 'Number of users active in the last 90 days',
        });
        const projectsTotal = createGauge({
            name: 'projects_total',
            help: 'Number of projects',
            labelNames: ['mode'],
        });
        const environmentsTotal = createGauge({
            name: 'environments_total',
            help: 'Number of environments',
        });
        const groupsTotal = createGauge({
            name: 'groups_total',
            help: 'Number of groups',
        });

        const rolesTotal = createGauge({
            name: 'roles_total',
            help: 'Number of roles',
        });

        const customRootRolesTotal = createGauge({
            name: 'custom_root_roles_total',
            help: 'Number of custom root roles',
        });

        const customRootRolesInUseTotal = createGauge({
            name: 'custom_root_roles_in_use_total',
            help: 'Number of custom root roles in use',
        });

        const segmentsTotal = createGauge({
            name: 'segments_total',
            help: 'Number of segments',
        });

        const contextTotal = createGauge({
            name: 'context_total',
            help: 'Number of context',
        });

        const strategiesTotal = createGauge({
            name: 'strategies_total',
            help: 'Number of strategies',
        });

        const clientAppsTotal = createGauge({
            name: 'client_apps_total',
            help: 'Number of registered client apps aggregated by range by last seen',
            labelNames: ['range'],
        });

        const samlEnabled = createGauge({
            name: 'saml_enabled',
            help: 'Whether SAML is enabled',
        });

        const oidcEnabled = createGauge({
            name: 'oidc_enabled',
            help: 'Whether OIDC is enabled',
        });

        const clientSdkVersionUsage = createCounter({
            name: 'client_sdk_versions',
            help: 'Which sdk versions are being used',
            labelNames: ['sdk_name', 'sdk_version'],
        });

        const productionChanges30 = createGauge({
            name: 'production_changes_30',
            help: 'Changes made to production environment last 30 days',
            labelNames: ['environment'],
        });
        const productionChanges60 = createGauge({
            name: 'production_changes_60',
            help: 'Changes made to production environment last 60 days',
            labelNames: ['environment'],
        });
        const productionChanges90 = createGauge({
            name: 'production_changes_90',
            help: 'Changes made to production environment last 90 days',
            labelNames: ['environment'],
        });

        const rateLimits = createGauge({
            name: 'rate_limits',
            help: 'Rate limits (per minute) for METHOD/ENDPOINT pairs',
            labelNames: ['endpoint', 'method'],
        });
        const featureCreatedByMigration = createCounter({
            name: 'feature_created_by_migration_count',
            help: 'Feature createdBy migration count',
        });
        const eventCreatedByMigration = createCounter({
            name: 'event_created_by_migration_count',
            help: 'Event createdBy migration count',
        });
        const proxyRepositoriesCreated = createCounter({
            name: 'proxy_repositories_created',
            help: 'Proxy repositories created',
        });
        const mapFeaturesForClientDuration = createHistogram({
            name: 'map_features_for_client_duration',
            help: 'Duration of mapFeaturesForClient function',
        });

        async function collectStaticCounters() {
            try {
                const stats = await instanceStatsService.getStats();

                featureTogglesTotal.reset();
                featureTogglesTotal
                    .labels({ version })
                    .set(stats.featureToggles);

                usersTotal.reset();
                usersTotal.set(stats.users);

                serviceAccounts.reset();
                serviceAccounts.set(stats.serviceAccounts);

                apiTokens.reset();

                for (const [type, value] of stats.apiTokens) {
                    apiTokens.labels({ type }).set(value);
                }

                enabledMetricsBucketsPreviousDay.reset();
                enabledMetricsBucketsPreviousDay.set(
                    stats.previousDayMetricsBucketsCount.enabledCount,
                );
                variantMetricsBucketsPreviousDay.reset();
                variantMetricsBucketsPreviousDay.set(
                    stats.previousDayMetricsBucketsCount.variantCount,
                );

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
                stats.clientApps.forEach(({ range, count }) =>
                    clientAppsTotal.labels({ range }).set(count),
                );

                rateLimits.reset();
                rateLimits
                    .labels({ endpoint: '/api/client/metrics', method: 'POST' })
                    .set(config.metricsRateLimiting.clientMetricsMaxPerMinute);
                rateLimits
                    .labels({
                        endpoint: '/api/client/register',
                        method: 'POST',
                    })
                    .set(config.metricsRateLimiting.clientRegisterMaxPerMinute);
                rateLimits
                    .labels({
                        endpoint: '/api/frontend/metrics',
                        method: 'POST',
                    })
                    .set(
                        config.metricsRateLimiting.frontendMetricsMaxPerMinute,
                    );
                rateLimits
                    .labels({
                        endpoint: '/api/frontend/register',
                        method: 'POST',
                    })
                    .set(
                        config.metricsRateLimiting.frontendRegisterMaxPerMinute,
                    );
                rateLimits
                    .labels({
                        endpoint: '/api/admin/user-admin',
                        method: 'POST',
                    })
                    .set(config.rateLimiting.createUserMaxPerMinute);
                rateLimits
                    .labels({ endpoint: '/auth/simple', method: 'POST' })
                    .set(config.rateLimiting.simpleLoginMaxPerMinute);
                rateLimits
                    .labels({
                        endpoint: '/auth/reset/password-email',
                        method: 'POST',
                    })
                    .set(config.rateLimiting.passwordResetMaxPerMinute);
                rateLimits
                    .labels({
                        endpoint: '/api/signal-endpoint/:name',
                        method: 'POST',
                    })
                    .set(
                        config.rateLimiting.callSignalEndpointMaxPerSecond * 60,
                    );
            } catch (e) {}
        }

        await schedulerService.schedule(
            collectStaticCounters.bind(this),
            hoursToMilliseconds(2),
            'collectStaticCounters',
            0, // no jitter
        );

        eventBus.on(
            events.REQUEST_TIME,
            ({ path, method, time, statusCode, appName }) => {
                requestDuration
                    .labels({ path, method, status: statusCode, appName })
                    .observe(time);
            },
        );

        eventBus.on(events.SCHEDULER_JOB_TIME, ({ jobId, time }) => {
            schedulerDuration.labels(jobId).observe(time);
        });

        eventBus.on(events.EVENTS_CREATED_BY_PROCESSED, ({ updated }) => {
            eventCreatedByMigration.inc(updated);
        });

        eventBus.on(events.FEATURES_CREATED_BY_PROCESSED, ({ updated }) => {
            featureCreatedByMigration.inc(updated);
        });

        eventBus.on(events.DB_TIME, ({ store, action, time }) => {
            dbDuration.labels({ store, action }).observe(time);
        });

        eventBus.on(events.PROXY_REPOSITORY_CREATED, () => {
            proxyRepositoriesCreated.inc();
        });

        eventBus.on(events.PROXY_FEATURES_FOR_TOKEN_TIME, ({ duration }) => {
            mapFeaturesForClientDuration.observe(duration);
        });

        eventStore.on(FEATURE_CREATED, ({ featureName, project }) => {
            featureToggleUpdateTotal.increment({
                toggle: featureName,
                project,
                environment: 'n/a',
                environmentType: 'n/a',
            });
        });
        eventStore.on(FEATURE_VARIANTS_UPDATED, ({ featureName, project }) => {
            featureToggleUpdateTotal.increment({
                toggle: featureName,
                project,
                environment: 'n/a',
                environmentType: 'n/a',
            });
        });
        eventStore.on(FEATURE_METADATA_UPDATED, ({ featureName, project }) => {
            featureToggleUpdateTotal.increment({
                toggle: featureName,
                project,
                environment: 'n/a',
                environmentType: 'n/a',
            });
        });
        eventStore.on(FEATURE_UPDATED, ({ featureName, project }) => {
            featureToggleUpdateTotal.increment({
                toggle: featureName,
                project,
                environment: 'default',
                environmentType: 'production',
            });
        });
        eventStore.on(
            FEATURE_STRATEGY_ADD,
            async ({ featureName, project, environment }) => {
                const environmentType = await this.resolveEnvironmentType(
                    environment,
                    cachedEnvironments,
                );
                featureToggleUpdateTotal.increment({
                    toggle: featureName,
                    project,
                    environment,
                    environmentType,
                });
            },
        );
        eventStore.on(
            FEATURE_STRATEGY_REMOVE,
            async ({ featureName, project, environment }) => {
                const environmentType = await this.resolveEnvironmentType(
                    environment,
                    cachedEnvironments,
                );
                featureToggleUpdateTotal.increment({
                    toggle: featureName,
                    project,
                    environment,
                    environmentType,
                });
            },
        );
        eventStore.on(
            FEATURE_STRATEGY_UPDATE,
            async ({ featureName, project, environment }) => {
                const environmentType = await this.resolveEnvironmentType(
                    environment,
                    cachedEnvironments,
                );
                featureToggleUpdateTotal.increment({
                    toggle: featureName,
                    project,
                    environment,
                    environmentType,
                });
            },
        );
        eventStore.on(
            FEATURE_ENVIRONMENT_DISABLED,
            async ({ featureName, project, environment }) => {
                const environmentType = await this.resolveEnvironmentType(
                    environment,
                    cachedEnvironments,
                );
                featureToggleUpdateTotal.increment({
                    toggle: featureName,
                    project,
                    environment,
                    environmentType,
                });
            },
        );
        eventStore.on(
            FEATURE_ENVIRONMENT_ENABLED,
            async ({ featureName, project, environment }) => {
                const environmentType = await this.resolveEnvironmentType(
                    environment,
                    cachedEnvironments,
                );
                featureToggleUpdateTotal.increment({
                    toggle: featureName,
                    project,
                    environment,
                    environmentType,
                });
            },
        );
        eventStore.on(FEATURE_ARCHIVED, ({ featureName, project }) => {
            featureToggleUpdateTotal.increment({
                toggle: featureName,
                project,
                environment: 'n/a',
                environmentType: 'n/a',
            });
        });
        eventStore.on(FEATURE_REVIVED, ({ featureName, project }) => {
            featureToggleUpdateTotal.increment({
                toggle: featureName,
                project,
                environment: 'n/a',
                environmentType: 'n/a',
            });
        });

        eventBus.on(CLIENT_METRICS, (m: ValidatedClientMetrics) => {
            for (const entry of Object.entries(m.bucket.toggles)) {
                featureToggleUsageTotal.increment(
                    {
                        toggle: entry[0],
                        active: 'true',
                        appName: m.appName,
                    },
                    entry[1].yes,
                );
                featureToggleUsageTotal.increment(
                    {
                        toggle: entry[0],
                        active: 'false',
                        appName: m.appName,
                    },
                    entry[1].no,
                );
            }
        });
        eventStore.on(CLIENT_REGISTER, (m) => {
            if (m.sdkVersion && m.sdkVersion.indexOf(':') > -1) {
                const [sdkName, sdkVersion] = m.sdkVersion.split(':');
                clientSdkVersionUsage.increment({
                    sdk_name: sdkName,
                    sdk_version: sdkVersion,
                });
            }
        });

        await this.configureDbMetrics(db, eventBus, schedulerService);

        return Promise.resolve();
    }

    async configureDbMetrics(
        db: Knex,
        eventBus: EventEmitter,
        schedulerService: SchedulerService,
    ): Promise<void> {
        if (db?.client) {
            const dbPoolMin = createGauge({
                name: 'db_pool_min',
                help: 'Minimum DB pool size',
            });
            dbPoolMin.set(db.client.pool.min);
            const dbPoolMax = createGauge({
                name: 'db_pool_max',
                help: 'Maximum DB pool size',
            });
            dbPoolMax.set(db.client.pool.max);
            const dbPoolFree = createGauge({
                name: 'db_pool_free',
                help: 'Current free connections in DB pool',
            });
            const dbPoolUsed = createGauge({
                name: 'db_pool_used',
                help: 'Current connections in use in DB pool',
            });
            const dbPoolPendingCreates = createGauge({
                name: 'db_pool_pending_creates',
                help: 'how many asynchronous create calls are running in DB pool',
            });
            const dbPoolPendingAcquires = createGauge({
                name: 'db_pool_pending_acquires',
                help: 'how many acquires are waiting for a resource to be released in DB pool',
            });

            eventBus.on(DB_POOL_UPDATE, (data) => {
                dbPoolFree.set(data.free);
                dbPoolUsed.set(data.used);
                dbPoolPendingCreates.set(data.pendingCreates);
                dbPoolPendingAcquires.set(data.pendingAcquires);
            });

            await schedulerService.schedule(
                this.registerPoolMetrics.bind(this, db.client.pool, eventBus),
                minutesToMilliseconds(1),
                'registerPoolMetrics',
                0, // no jitter
            );
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

    async resolveEnvironmentType(
        environment: string,
        cachedEnvironments: () => Promise<IEnvironment[]>,
    ): Promise<string> {
        const environments = await cachedEnvironments();
        const env = environments.find((e) => e.name === environment);

        if (env) {
            return env.type;
        } else {
            return 'unknown';
        }
    }
}
export function createMetricsMonitor(): MetricsMonitor {
    return new MetricsMonitor();
}

module.exports = {
    createMetricsMonitor,
};
