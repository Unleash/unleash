import { collectDefaultMetrics } from 'prom-client';
import memoizee from 'memoizee';
import type EventEmitter from 'events';
import type { Knex } from 'knex';
import * as events from './metric-events.js';
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
    PROJECT_ENVIRONMENT_REMOVED,
    PROJECT_CREATED,
    PROJECT_ARCHIVED,
    PROJECT_REVIVED,
    PROJECT_DELETED,
    RELEASE_PLAN_ADDED,
    RELEASE_PLAN_REMOVED,
    RELEASE_PLAN_MILESTONE_STARTED,
} from './events/index.js';
import type { IUnleashConfig } from './types/option.js';
import type { IUnleashStores } from './types/stores.js';
import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';
import type { InstanceStatsService } from './features/instance-stats/instance-stats-service.js';
import type { IEnvironment, ISdkHeartbeat } from './types/index.js';
import {
    createCounter,
    createGauge,
    createSummary,
    createHistogram,
} from './util/metrics/index.js';
import type { SchedulerService } from './services/index.js';
import type { IClientMetricsEnv } from './features/metrics/client-metrics/client-metrics-store-v2-type.js';
import { DbMetricsMonitor } from './metrics-gauge.js';
import * as impactMetrics from './features/metrics/impact/define-impact-metrics.js';

export function registerPrometheusPostgresMetrics(
    db: Knex,
    eventBus: EventEmitter,
    postgresVersion: string,
) {
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

        const database_version = createGauge({
            name: 'postgres_version',
            help: 'Which version of postgres is running (SHOW server_version)',
            labelNames: ['version'],
        });
        database_version.labels({ version: postgresVersion }).set(1);
    }
}

export function registerPrometheusMetrics(
    config: IUnleashConfig,
    stores: IUnleashStores,
    version: string,
    eventBus: EventEmitter,
    instanceStatsService: InstanceStatsService,
) {
    const resolveEnvironmentType = async (
        environment: string,
        cachedEnvironments: () => Promise<IEnvironment[]>,
    ): Promise<string> => {
        const environments = await cachedEnvironments();
        const env = environments.find((e) => e.name === environment);

        if (env) {
            return env.type;
        } else {
            return 'unknown';
        }
    };

    const { eventStore, environmentStore } = stores;
    const { flagResolver } = config;
    const dbMetrics = new DbMetricsMonitor(config);

    const cachedEnvironments: () => Promise<IEnvironment[]> = memoizee(
        async () => environmentStore.getAll(),
        {
            promise: true,
            maxAge: hoursToMilliseconds(1),
        },
    );

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
    const functionDuration = createSummary({
        name: 'function_duration_seconds',
        help: 'Function duration time',
        labelNames: ['functionName', 'className'],
        percentiles: [0.1, 0.5, 0.9, 0.95, 0.99],
        maxAgeSeconds: 600,
        ageBuckets: 5,
    });
    const featureFlagUpdateTotal = createCounter({
        name: 'feature_toggle_update_total',
        help: 'Number of times a flag has been updated. Environment label would be "n/a" when it is not available, e.g. when a feature flag is created.',
        labelNames: [
            'toggle',
            'project',
            'environment',
            'environmentType',
            'action',
        ],
    });
    const featureFlagUsageTotal = createCounter({
        name: 'feature_toggle_usage_total',
        help: 'Number of times a feature flag has been used',
        labelNames: ['toggle', 'active', 'appName'],
    });
    const clientRegistrationTotal = createCounter({
        name: 'client_registration_total',
        help: 'Number of times a an application have registered',
        labelNames: ['appName', 'environment', 'interval'],
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'feature_toggles_total',
        help: 'Number of feature flags',
        labelNames: ['version'],
        query: () => instanceStatsService.getToggleCount(),
        map: (value) => ({ value, labels: { version } }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'max_feature_environment_strategies',
        help: 'Maximum number of environment strategies in one feature',
        labelNames: ['feature', 'environment'],
        query: () =>
            stores.featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies(),
        map: (result) => ({
            value: result.count,
            labels: {
                environment: result.environment,
                feature: result.feature,
            },
        }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'max_feature_strategies',
        help: 'Maximum number of strategies in one feature',
        labelNames: ['feature'],
        query: () =>
            stores.featureStrategiesReadModel.getMaxFeatureStrategies(),
        map: (result) => ({
            value: result.count,
            labels: { feature: result.feature },
        }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'max_constraint_values',
        help: 'Maximum number of constraint values used in a single constraint',
        labelNames: ['feature', 'environment'],
        query: () => stores.featureStrategiesReadModel.getMaxConstraintValues(),
        map: (result) => ({
            value: result.count,
            labels: {
                environment: result.environment,
                feature: result.feature,
            },
        }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'max_strategy_constraints',
        help: 'Maximum number of constraints used on a single strategy',
        labelNames: ['feature', 'environment'],
        query: () =>
            stores.featureStrategiesReadModel.getMaxConstraintsPerStrategy(),
        map: (result) => ({
            value: result.count,
            labels: {
                environment: result.environment,
                feature: result.feature,
            },
        }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'largest_project_environment_size',
        help: 'The largest project environment size (bytes) based on strategies, constraints, variants and parameters',
        labelNames: ['project', 'environment'],
        query: () =>
            stores.largestResourcesReadModel.getLargestProjectEnvironments(1),
        map: (results) => {
            const result = results[0];
            return {
                value: result.size,
                labels: {
                    project: result.project,
                    environment: result.environment,
                },
            };
        },
    });
    dbMetrics.registerGaugeDbMetric({
        name: 'largest_feature_environment_size',
        help: 'The largest feature environment size (bytes) base on strategies, constraints, variants and parameters',
        labelNames: ['feature', 'environment'],
        query: () =>
            stores.largestResourcesReadModel.getLargestFeatureEnvironments(1),
        map: (results) => {
            const result = results[0];
            return {
                value: result.size,
                labels: {
                    feature: result.feature,
                    environment: result.environment,
                },
            };
        },
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'unique_sdk_connections_total',
        help: 'The number of unique SDK connections for the full previous hour across all instances. Available only for SDKs reporting `unleash-connection-id`',
        query: () => {
            if (flagResolver.isEnabled('uniqueSdkTracking')) {
                return stores.uniqueConnectionReadModel.getStats();
            }
            return Promise.resolve({ previous: 0 });
        },
        map: (result) => ({ value: result.previous }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'unique_backend_sdk_connections_total',
        help: 'The number of unique backend SDK connections for the full previous hour across all instances. Available only for SDKs reporting `unleash-connection-id`',
        query: () => {
            if (flagResolver.isEnabled('uniqueSdkTracking')) {
                return stores.uniqueConnectionReadModel.getStats();
            }
            return Promise.resolve({ previousBackend: 0 });
        },
        map: (result) => ({ value: result.previousBackend }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'unique_frontend_sdk_connections_total',
        help: 'The number of unique frontend SDK connections for the full previous hour across all instances. Available only for SDKs reporting `unleash-connection-id`',
        query: () => {
            if (flagResolver.isEnabled('uniqueSdkTracking')) {
                return stores.uniqueConnectionReadModel.getStats();
            }
            return Promise.resolve({ previousFrontend: 0 });
        },
        map: (result) => ({ value: result.previousFrontend }),
    });

    const featureTogglesArchivedTotal = createGauge({
        name: 'feature_toggles_archived_total',
        help: 'Number of archived feature flags',
    });
    createGauge({
        name: 'users_total',
        help: 'Number of users',
        fetchValue: () => stores.userStore.count(),
        ttlMs: minutesToMilliseconds(15),
    });
    const trafficTotal = createGauge({
        name: 'traffic_total',
        help: 'Traffic used current month',
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
    dbMetrics.registerGaugeDbMetric({
        name: 'projects_total',
        help: 'Number of projects',
        labelNames: ['mode'],
        query: () => instanceStatsService.getProjectModeCount(),
        map: (projects) =>
            projects.map((projectStat) => ({
                value: projectStat.count,
                labels: { mode: projectStat.mode },
            })),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'environments_total',
        help: 'Number of environments',
        query: () => instanceStatsService.environmentCount(),
        map: (result) => ({ value: result }),
    });
    dbMetrics.registerGaugeDbMetric({
        name: 'groups_total',
        help: 'Number of groups',
        query: () => instanceStatsService.groupCount(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'roles_total',
        help: 'Number of roles',
        query: () => instanceStatsService.roleCount(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'custom_root_roles_total',
        help: 'Number of custom root roles',
        query: () => instanceStatsService.customRolesCount(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'custom_root_roles_in_use_total',
        help: 'Number of custom root roles in use',
        query: () => instanceStatsService.customRolesCountInUse(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'segments_total',
        help: 'Number of segments',
        query: () => instanceStatsService.segmentCount(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'context_total',
        help: 'Number of context',
        query: () => instanceStatsService.contextFieldCount(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'project_context_total',
        help: 'Number of project context fields',
        query: () => instanceStatsService.projectContextFieldCount(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'strategies_total',
        help: 'Number of strategies',
        query: () => instanceStatsService.strategiesCount(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'custom_strategies_total',
        help: 'Number of custom strategies',
        query: () => instanceStatsService.customStrategiesCount(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'custom_strategies_in_use_total',
        help: 'Number of custom strategies in use',
        query: () => instanceStatsService.customStrategiesInUseCount(),
        map: (result) => ({ value: result }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'client_apps_total',
        help: 'Number of registered client apps aggregated by range by last seen',
        labelNames: ['range'],
        query: () => instanceStatsService.getLabeledAppCounts(),
        map: (result) =>
            Object.entries(result).map(([range, count]) => ({
                value: count,
                labels: { range },
            })),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'saml_enabled',
        help: 'Whether SAML is enabled',
        query: () => instanceStatsService.hasSAML(),
        map: (result) => ({ value: result ? 1 : 0 }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'oidc_enabled',
        help: 'Whether OIDC is enabled',
        query: () => instanceStatsService.hasOIDC(),
        map: (result) => ({ value: result ? 1 : 0 }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'password_auth_enabled',
        help: 'Whether password auth is enabled',
        query: () => instanceStatsService.hasPasswordAuth(),
        map: (result) => ({ value: result ? 1 : 0 }),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'scim_enabled',
        help: 'Whether SCIM is enabled',
        query: () => instanceStatsService.hasSCIM(),
        map: (result) => ({ value: result ? 1 : 0 }),
    });

    const clientSdkVersionUsage = createCounter({
        name: 'client_sdk_versions',
        help: 'Which sdk versions are being used',
        labelNames: [
            'sdk_name',
            'sdk_version',
            'platform_name',
            'platform_version',
            'yggdrasil_version',
            'spec_version',
        ],
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
    rateLimits
        .labels({
            endpoint: '/api/client/metrics',
            method: 'POST',
        })
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
        .set(config.metricsRateLimiting.frontendMetricsMaxPerMinute);
    rateLimits
        .labels({
            endpoint: '/api/frontend/register',
            method: 'POST',
        })
        .set(config.metricsRateLimiting.frontendRegisterMaxPerMinute);
    rateLimits
        .labels({
            endpoint: '/api/admin/user-admin',
            method: 'POST',
        })
        .set(config.rateLimiting.createUserMaxPerMinute);
    rateLimits
        .labels({
            endpoint: '/auth/simple',
            method: 'POST',
        })
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
        .set(config.rateLimiting.callSignalEndpointMaxPerSecond * 60);

    const namePrefixUsed = createCounter({
        name: 'nameprefix_count',
        help: 'Count of nameprefix usage in client api',
    });

    const tagsUsed = createCounter({
        name: 'tags_count',
        help: 'Count of tags usage in client api',
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
    const frontendApiRepositoriesCreated = createCounter({
        name: 'frontend_api_repositories_created',
        help: 'Frontend API repositories created',
    });
    const mapFeaturesForClientDuration = createHistogram({
        name: 'map_features_for_client_duration',
        help: 'Duration of mapFeaturesForClient function',
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'feature_lifecycle_stage_duration',
        labelNames: ['stage', 'project_id'],
        help: 'Duration of feature lifecycle stages',
        query: () => stores.featureLifecycleReadModel.getAllWithStageDuration(),
        map: (result) =>
            result.map((stageResult) => ({
                value: stageResult.duration,
                labels: {
                    project_id: stageResult.project,
                    stage: stageResult.stage,
                },
            })),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'onboarding_duration',
        labelNames: ['event'],
        help: 'firstLogin, secondLogin, firstFeatureFlag, firstPreLive, firstLive from first user creation',
        query: () => stores.onboardingReadModel.getInstanceOnboardingMetrics(),
        map: (result) =>
            Object.keys(result)
                .filter((key) => Number.isInteger(result[key]))
                .map((key) => ({
                    value: result[key],
                    labels: {
                        event: key,
                    },
                })),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'project_onboarding_duration',
        labelNames: ['event', 'project'],
        help: 'firstFeatureFlag, firstPreLive, firstLive from project creation',
        query: () => stores.onboardingReadModel.getProjectsOnboardingMetrics(),
        map: (projectsOnboardingMetrics) =>
            projectsOnboardingMetrics.flatMap(
                ({ project, ...projectMetrics }) =>
                    Object.keys(projectMetrics)
                        .filter((key) => Number.isInteger(projectMetrics[key]))
                        .map((key) => ({
                            value: projectMetrics[key],
                            labels: {
                                event: key,
                                project,
                            },
                        })),
            ),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'feature_lifecycle_stage_count_by_project',
        help: 'Count features in a given stage by project id',
        labelNames: ['stage', 'project_id'],
        query: () => stores.featureLifecycleReadModel.getStageCountByProject(),
        map: (result) =>
            result.map((stageResult) => ({
                value: stageResult.count,
                labels: {
                    project_id: stageResult.project,
                    stage: stageResult.stage,
                },
            })),
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'feature_link_by_domain',
        help: 'Count most popular domains used in feature links',
        labelNames: ['domain'],
        query: () => {
            return stores.featureLinkReadModel.getTopDomains();
        },
        map: (result) =>
            result.map(({ domain, count }) => ({
                value: count,
                labels: {
                    domain,
                },
            })),
    });

    const featureLifecycleStageEnteredCounter = createCounter({
        name: 'feature_lifecycle_stage_entered',
        help: 'Count how many features entered a given stage',
        labelNames: ['stage'],
    });

    const projectActionsCounter = createCounter({
        name: 'project_actions_count',
        help: 'Count project actions',
        labelNames: ['action'],
    });

    const projectEnvironmentsDisabled = createCounter({
        name: 'project_environments_disabled',
        help: 'How many "environment disabled" events we have received for each project',
        labelNames: ['project_id'],
    });

    const orphanedTokensTotal = createGauge({
        name: 'orphaned_api_tokens_total',
        help: 'Number of API tokens without a project',
    });

    const clientFeaturesMemory = createGauge({
        name: 'client_features_memory',
        help: 'The amount of memory client features endpoint is using for caching',
    });

    const clientDeltaMemory = createGauge({
        name: 'client_delta_memory',
        help: 'The amount of memory client features delta endpoint is using for caching',
    });

    const orphanedTokensActive = createGauge({
        name: 'orphaned_api_tokens_active',
        help: 'Number of API tokens without a project, last seen within 3 months',
    });

    const legacyTokensTotal = createGauge({
        name: 'legacy_api_tokens_total',
        help: 'Number of API tokens with v1 format',
    });

    const legacyTokensActive = createGauge({
        name: 'legacy_api_tokens_active',
        help: 'Number of API tokens with v1 format, last seen within 3 months',
    });

    const exceedsLimitErrorCounter = createCounter({
        name: 'exceeds_limit_error',
        help: 'The number of exceeds limit errors registered by this instance.',
        labelNames: ['resource', 'limit'],
    });

    const requestOriginCounter = createCounter({
        name: 'request_origin_counter',
        help: 'Number of authenticated requests, including origin information.',
        labelNames: ['type', 'method', 'source'],
    });

    const resourceLimit = createGauge({
        name: 'resource_limit',
        help: 'The maximum number of resources allowed.',
        labelNames: ['resource'],
    });
    for (const [resource, limit] of Object.entries(config.resourceLimits)) {
        resourceLimit.labels({ resource }).set(limit);
    }

    const licensedUsers = createGauge({
        name: 'licensed_users',
        help: 'The number of seats used.',
    });

    const addonEventsHandledCounter = createCounter({
        name: 'addon_events_handled',
        help: 'Events handled by addons and the result.',
        labelNames: ['result', 'destination'],
    });

    const unknownFlagsGauge = createGauge({
        name: 'unknown_flags',
        help: 'Number of unknown flag reports (name + app + env) in the last 24 hours, if any.',
    });

    const unknownFlagsUniqueNamesGauge = createGauge({
        name: 'unknown_flags_unique_names',
        help: 'Number of unique unknown flag names reported in the last 24 hours, if any.',
    });

    dbMetrics.registerGaugeDbMetric({
        name: 'users_read_only_total',
        help: 'Number of read-only users (viewers with no permissions or write events).',
        query: () => {
            if (flagResolver.isEnabled('readOnlyUsers')) {
                return instanceStatsService.getReadOnlyUsers();
            }
            return Promise.resolve(0);
        },
        map: (result) => ({ value: result }),
    });

    // register event listeners
    eventBus.on(
        events.EXCEEDS_LIMIT,
        ({ resource, limit }: { resource: string; limit: number }) => {
            exceedsLimitErrorCounter.increment({ resource, limit });
        },
    );

    eventBus.on(
        events.STAGE_ENTERED,
        (entered: { stage: string; feature: string }) => {
            featureLifecycleStageEnteredCounter.increment({
                stage: entered.stage,
            });
        },
    );

    eventBus.on(
        events.REQUEST_TIME,
        ({ path, method, time, statusCode, appName }) => {
            requestDuration
                .labels({
                    path,
                    method,
                    status: statusCode,
                    appName,
                })
                .observe(time);
            config.flagResolver.impactMetrics?.incrementCounter(
                impactMetrics.REQUEST_COUNT,
                1,
                { flagNames: ['consumptionModel'], context: {} },
            );
            config.flagResolver.impactMetrics?.observeHistogram(
                impactMetrics.REQUEST_TIME_MS,
                time,
            );
        },
    );

    eventBus.on(events.SCHEDULER_JOB_TIME, ({ jobId, time }) => {
        schedulerDuration.labels(jobId).observe(time);
        config.flagResolver.impactMetrics?.observeHistogram(
            impactMetrics.SCHEDULER_JOB_TIME_SECONDS,
            time,
        );
    });

    eventBus.on(events.FUNCTION_TIME, ({ functionName, className, time }) => {
        functionDuration
            .labels({
                functionName,
                className,
            })
            .observe(time);
    });

    eventBus.on(events.EVENTS_CREATED_BY_PROCESSED, ({ updated }) => {
        eventCreatedByMigration.inc(updated);
    });

    eventBus.on(events.FEATURES_CREATED_BY_PROCESSED, ({ updated }) => {
        featureCreatedByMigration.inc(updated);
    });

    eventBus.on(events.DB_TIME, ({ store, action, time }) => {
        dbDuration
            .labels({
                store,
                action,
            })
            .observe(time);
    });

    eventBus.on(events.PROXY_REPOSITORY_CREATED, () => {
        proxyRepositoriesCreated.inc();
    });

    eventBus.on(events.FRONTEND_API_REPOSITORY_CREATED, () => {
        frontendApiRepositoriesCreated.inc();
    });

    eventBus.on(events.PROXY_FEATURES_FOR_TOKEN_TIME, ({ duration }) => {
        mapFeaturesForClientDuration.observe(duration);
    });

    eventBus.on(events.CLIENT_METRICS_NAMEPREFIX, () => {
        namePrefixUsed.inc();
    });

    eventBus.on(events.CLIENT_METRICS_TAGS, () => {
        tagsUsed.inc();
    });

    eventBus.on(events.CLIENT_FEATURES_MEMORY, (event: { memory: number }) => {
        clientFeaturesMemory.reset();
        clientFeaturesMemory.set(event.memory);
    });

    eventBus.on(events.CLIENT_DELTA_MEMORY, (event: { memory: number }) => {
        clientDeltaMemory.reset();
        clientDeltaMemory.set(event.memory);
    });
    eventBus.on(
        events.CLIENT_REGISTERED,
        ({ appName, environment, interval }) => {
            clientRegistrationTotal
                .labels({ appName, environment, interval })
                .inc();
        },
    );

    events.onMetricEvent(
        eventBus,
        events.REQUEST_ORIGIN,
        ({ type, method, source }) => {
            requestOriginCounter.increment({
                type,
                method,
                source: source || 'unknown',
            });
        },
    );

    eventStore.on(FEATURE_CREATED, ({ featureName, project }) => {
        featureFlagUpdateTotal.increment({
            toggle: featureName,
            project,
            environment: 'n/a',
            environmentType: 'n/a',
            action: 'created',
        });
    });
    eventStore.on(FEATURE_VARIANTS_UPDATED, ({ featureName, project }) => {
        featureFlagUpdateTotal.increment({
            toggle: featureName,
            project,
            environment: 'n/a',
            environmentType: 'n/a',
            action: 'updated',
        });
    });
    eventStore.on(FEATURE_METADATA_UPDATED, ({ featureName, project }) => {
        featureFlagUpdateTotal.increment({
            toggle: featureName,
            project,
            environment: 'n/a',
            environmentType: 'n/a',
            action: 'updated',
        });
    });
    eventStore.on(FEATURE_UPDATED, ({ featureName, project }) => {
        featureFlagUpdateTotal.increment({
            toggle: featureName,
            project,
            environment: 'n/a',
            environmentType: 'n/a',
            action: 'updated',
        });
    });
    eventStore.on(
        FEATURE_STRATEGY_ADD,
        async ({ featureName, project, environment }) => {
            const environmentType = await resolveEnvironmentType(
                environment,
                cachedEnvironments,
            );
            featureFlagUpdateTotal.increment({
                toggle: featureName,
                project,
                environment,
                environmentType,
                action: 'updated',
            });
        },
    );
    eventStore.on(
        FEATURE_STRATEGY_REMOVE,
        async ({ featureName, project, environment }) => {
            const environmentType = await resolveEnvironmentType(
                environment,
                cachedEnvironments,
            );
            featureFlagUpdateTotal.increment({
                toggle: featureName,
                project,
                environment,
                environmentType,
                action: 'updated',
            });
        },
    );
    eventStore.on(
        FEATURE_STRATEGY_UPDATE,
        async ({ featureName, project, environment }) => {
            const environmentType = await resolveEnvironmentType(
                environment,
                cachedEnvironments,
            );
            featureFlagUpdateTotal.increment({
                toggle: featureName,
                project,
                environment,
                environmentType,
                action: 'updated',
            });
        },
    );
    eventStore.on(
        FEATURE_ENVIRONMENT_DISABLED,
        async ({ featureName, project, environment }) => {
            const environmentType = await resolveEnvironmentType(
                environment,
                cachedEnvironments,
            );
            featureFlagUpdateTotal.increment({
                toggle: featureName,
                project,
                environment,
                environmentType,
                action: 'updated',
            });
        },
    );
    eventStore.on(
        FEATURE_ENVIRONMENT_ENABLED,
        async ({ featureName, project, environment }) => {
            const environmentType = await resolveEnvironmentType(
                environment,
                cachedEnvironments,
            );
            featureFlagUpdateTotal.increment({
                toggle: featureName,
                project,
                environment,
                environmentType,
                action: 'updated',
            });
        },
    );
    eventStore.on(FEATURE_ARCHIVED, ({ featureName, project }) => {
        featureFlagUpdateTotal.increment({
            toggle: featureName,
            project,
            environment: 'n/a',
            environmentType: 'n/a',
            action: 'archived',
        });
    });
    eventStore.on(FEATURE_REVIVED, ({ featureName, project }) => {
        featureFlagUpdateTotal.increment({
            toggle: featureName,
            project,
            environment: 'n/a',
            environmentType: 'n/a',
            action: 'revived',
        });
    });

    eventStore.on(
        RELEASE_PLAN_ADDED,
        async ({ featureName, project, environment }) => {
            const environmentType = await resolveEnvironmentType(
                environment,
                cachedEnvironments,
            );
            featureFlagUpdateTotal.increment({
                toggle: featureName,
                project,
                environment,
                environmentType,
                action: 'updated',
            });
        },
    );

    eventStore.on(
        RELEASE_PLAN_REMOVED,
        async ({ featureName, project, environment }) => {
            const environmentType = await resolveEnvironmentType(
                environment,
                cachedEnvironments,
            );
            featureFlagUpdateTotal.increment({
                toggle: featureName,
                project,
                environment,
                environmentType,
                action: 'updated',
            });
        },
    );

    eventStore.on(
        RELEASE_PLAN_MILESTONE_STARTED,
        async ({ featureName, project, environment }) => {
            const environmentType = await resolveEnvironmentType(
                environment,
                cachedEnvironments,
            );
            featureFlagUpdateTotal.increment({
                toggle: featureName,
                project,
                environment,
                environmentType,
                action: 'updated',
            });
        },
    );

    eventStore.on(PROJECT_CREATED, () => {
        projectActionsCounter.increment({ action: PROJECT_CREATED });
    });
    eventStore.on(PROJECT_ARCHIVED, () => {
        projectActionsCounter.increment({ action: PROJECT_ARCHIVED });
    });
    eventStore.on(PROJECT_REVIVED, () => {
        projectActionsCounter.increment({ action: PROJECT_REVIVED });
    });
    eventStore.on(PROJECT_DELETED, () => {
        projectActionsCounter.increment({ action: PROJECT_DELETED });
    });

    const logger = config.getLogger('metrics.ts');
    eventBus.on(CLIENT_METRICS, (metrics: IClientMetricsEnv[]) => {
        try {
            for (const metric of metrics) {
                featureFlagUsageTotal.increment(
                    {
                        toggle: metric.featureName,
                        active: 'true',
                        appName: metric.appName,
                    },
                    metric.yes,
                );
                featureFlagUsageTotal.increment(
                    {
                        toggle: metric.featureName,
                        active: 'false',
                        appName: metric.appName,
                    },
                    metric.no,
                );
            }
        } catch (e) {
            logger.warn('Metrics registration failed', e);
        }
    });

    eventStore.on(CLIENT_REGISTER, (heartbeatEvent: ISdkHeartbeat) => {
        if (!heartbeatEvent.sdkName || !heartbeatEvent.sdkVersion) {
            return;
        }

        if (flagResolver.isEnabled('extendedMetrics')) {
            clientSdkVersionUsage.increment({
                sdk_name: heartbeatEvent.sdkName,
                sdk_version: heartbeatEvent.sdkVersion,
                platform_name:
                    heartbeatEvent.metadata?.platformName ?? 'not-set',
                platform_version:
                    heartbeatEvent.metadata?.platformVersion ?? 'not-set',
                yggdrasil_version:
                    heartbeatEvent.metadata?.yggdrasilVersion ?? 'not-set',
                spec_version: heartbeatEvent.metadata?.specVersion ?? 'not-set',
            });
        } else {
            clientSdkVersionUsage.increment({
                sdk_name: heartbeatEvent.sdkName,
                sdk_version: heartbeatEvent.sdkVersion,
                platform_name: 'not-set',
                platform_version: 'not-set',
                yggdrasil_version: 'not-set',
                spec_version: 'not-set',
            });
        }
    });

    eventStore.on(PROJECT_ENVIRONMENT_REMOVED, ({ project }) => {
        projectEnvironmentsDisabled.increment({ project_id: project });
    });

    eventBus.on(events.ADDON_EVENTS_HANDLED, ({ result, destination }) => {
        addonEventsHandledCounter.increment({ result, destination });
    });

    return {
        collectAggDbMetrics: dbMetrics.refreshMetrics,
        collectStaticCounters: async () => {
            try {
                config.flagResolver.impactMetrics?.updateGauge(
                    impactMetrics.HEAP_MEMORY_TOTAL,
                    process.memoryUsage().heapUsed,
                    { flagNames: ['consumptionModel'], context: {} },
                );
                featureTogglesArchivedTotal.reset();
                featureTogglesArchivedTotal.set(
                    await instanceStatsService.getArchivedToggleCount(),
                );

                serviceAccounts.reset();
                serviceAccounts.set(
                    await instanceStatsService.countServiceAccounts(),
                );

                trafficTotal.reset();
                trafficTotal.set(
                    await instanceStatsService.getCurrentTrafficData(),
                );

                apiTokens.reset();

                for (const [
                    type,
                    value,
                ] of await instanceStatsService.countApiTokensByType()) {
                    apiTokens.labels({ type }).set(value);
                }

                const deprecatedTokens =
                    await stores.apiTokenStore.countDeprecatedTokens();
                orphanedTokensTotal.reset();
                orphanedTokensTotal.set(deprecatedTokens.orphanedTokens);

                orphanedTokensActive.reset();
                orphanedTokensActive.set(deprecatedTokens.activeOrphanedTokens);

                legacyTokensTotal.reset();
                legacyTokensTotal.set(deprecatedTokens.legacyTokens);

                legacyTokensActive.reset();
                legacyTokensActive.set(deprecatedTokens.activeLegacyTokens);

                const previousDayMetricsBucketsCount =
                    await instanceStatsService.countPreviousDayHourlyMetricsBuckets();
                enabledMetricsBucketsPreviousDay.reset();
                enabledMetricsBucketsPreviousDay.set(
                    previousDayMetricsBucketsCount.enabledCount,
                );
                variantMetricsBucketsPreviousDay.reset();
                variantMetricsBucketsPreviousDay.set(
                    previousDayMetricsBucketsCount.variantCount,
                );

                const activeUsers = await instanceStatsService.getActiveUsers();
                usersActive7days.reset();
                usersActive7days.set(activeUsers.last7);
                usersActive30days.reset();
                usersActive30days.set(activeUsers.last30);
                usersActive60days.reset();
                usersActive60days.set(activeUsers.last60);
                usersActive90days.reset();
                usersActive90days.set(activeUsers.last90);

                const licensedUsersStat =
                    await instanceStatsService.getLicencedUsers();
                licensedUsers.reset();
                licensedUsers.set(licensedUsersStat);

                const productionChanges =
                    await instanceStatsService.getProductionChanges();
                productionChanges30.reset();
                productionChanges30.set(productionChanges.last30);
                productionChanges60.reset();
                productionChanges60.set(productionChanges.last60);
                productionChanges90.reset();
                productionChanges90.set(productionChanges.last90);

                const unknownFlags = await stores.unknownFlagsStore.count();
                unknownFlagsGauge.reset();
                unknownFlagsGauge.set(unknownFlags);

                const unknownFlagsUniqueNames =
                    await stores.unknownFlagsStore.count({ unique: true });
                unknownFlagsUniqueNamesGauge.reset();
                unknownFlagsUniqueNamesGauge.set(unknownFlagsUniqueNames);
            } catch (_e) {}
        },
    };
}
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

        collectDefaultMetrics();

        const { collectStaticCounters, collectAggDbMetrics } =
            registerPrometheusMetrics(
                config,
                stores,
                version,
                eventBus,
                instanceStatsService,
            );

        const postgresVersion = await stores.settingStore.postgresVersion();
        registerPrometheusPostgresMetrics(db, eventBus, postgresVersion);

        await schedulerService.schedule(
            async () =>
                Promise.all([collectStaticCounters(), collectAggDbMetrics()]),
            hoursToMilliseconds(1),
            'collectStaticCounters',
        );
        await schedulerService.schedule(
            async () =>
                this.registerPoolMetrics.bind(this, db.client.pool, eventBus),
            minutesToMilliseconds(1),
            'registerPoolMetrics',
        );

        return Promise.resolve();
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
        } catch (_e) {}
    }
}

export function createMetricsMonitor(): MetricsMonitor {
    return new MetricsMonitor();
}
