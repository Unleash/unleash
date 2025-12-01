import stoppable, { type StoppableServer } from 'stoppable';
import { promisify } from 'util';
import version from './util/version.js';
import { migrateDb, requiresMigration, resetDb } from '../migrator.js';
import getApp from './app.js';
import type MetricsMonitor from './metrics.js';
import { createMetricsMonitor } from './metrics.js';
import { createStores } from './db/index.js';
import { createConfig } from './create-config.js';
import registerGracefulShutdown from './util/graceful-shutdown.js';
import { createDb } from './db/db-pool.js';
import sessionDb from './middleware/session-db.js';
import { ApiTokenType } from './types/index.js'; // Not really a type. It's an enum so we need the value
// Types
import type {
    Db,
    IImportTogglesStore,
    IUnleash,
    IUnleashConfig,
    IUnleashOptions,
    IUnleashStores,
} from './types/index.js';
import {
    createServices,
    type IUnleashServices,
    type PatService,
} from './services/index.js';
import { defaultLockKey, defaultTimeout, withDbLock } from './util/db-lock.js';
import { scheduleServices } from './features/scheduler/schedule-services.js';
import { compareAndLogPostgresVersion } from './util/postgres-version-checker.js';
import {
    createKnexTransactionStarter,
    type TransactionCreator,
    type UnleashTransaction,
    withFakeTransactional,
    type WithRollbackTransaction,
    withRollbackTransaction,
    type WithTransactional,
    withTransactional,
} from './db/transaction.js';
import Controller from './routes/controller.js';
import { createClientFeatureToggleDelta } from './features/client-feature-toggles/delta/createClientFeatureToggleDelta.js';
import { CRUDStore } from './db/crud/crud-store.js';
import type { CrudStoreConfig } from './db/crud/crud-store.js';
import { type Logger, LogLevel, type LogProvider } from './logger.js';
import { ImportTogglesStore } from './features/export-import-toggles/import-toggles-store.js';
import { ALL_PROJECTS, CUSTOM_ROOT_ROLE_TYPE } from './util/index.js';
import {
    extractAuditInfoFromUser,
    getVariantValue,
    isDefined,
    parseEnvVarBoolean,
    randomId,
} from './util/index.js';
import type {
    IRole,
    IRoleWithPermissions,
    IRoleWithProject,
    IUserPermission,
} from './types/stores/access-store.js';
import { createTestConfig } from '../test/config/test-config.js';
import NoAuthUser from './types/no-auth-user.js';
import { ALL, isAllProjects } from './types/models/api-token.js';
import type { Store } from './types/stores/store.js';
import { defaultFromRow, defaultToRow } from './db/crud/default-mappings.js';
import type {
    ICreateUser,
    IUserLookup,
    IUserUpdateFields,
} from './types/stores/user-store.js';
import type {
    ICreateUserWithRole,
    IUpdateUser,
} from './services/user-service.js';
import type { FromQueryParams } from './openapi/util/from-query-params.js';
import type { ISegmentService } from './features/segment/segment-service-interface.js';
import type { IAccessReadModel } from './features/access/access-read-model-type.js';
import type { IStatMonthlyTrafficUsage } from './features/traffic-data-usage/traffic-data-usage-store-type.js';
import type { Row } from './db/crud/row-type.js';
import { querySchema } from './schema/feature-schema.js';
import {
    type BasePaginationParameters,
    basePaginationParameters,
} from './openapi/spec/base-pagination-parameters.js';
import type { AccessReadModel } from './features/access/access-read-model.js';
import { flattenPayload } from './util/flattenPayload.js';
import type { Constraint } from 'unleash-client/lib/strategy/strategy.js';
import {
    type ClientFeatureToggleDelta,
    type DeltaEvent,
    UPDATE_DELTA,
} from './features/client-feature-toggles/delta/client-feature-toggle-delta.js';
import type { IQueryParam } from './features/feature-toggle/types/feature-toggle-strategies-store-type.js';
import {
    applyGenericQueryParams,
    normalizeQueryParams,
    parseSearchOperatorValue,
} from './features/feature-search/search-utils.js';
import {
    createAccessService,
    createChangeRequestAccessReadModel,
    createContextService,
    createEventsService,
    createFakeInstanceStatsService,
    createFakeProjectService,
    createFeatureToggleService,
    createInstanceStatsService,
    createProjectService,
    createTagTypeService,
    createExportImportTogglesService,
    DB_TIME,
    findParam,
    conditionalMiddleware,
    createPlaygroundService,
    createSegmentService,
    createFakeEventsService,
    createFakeFeatureToggleService,
    createFakeSegmentService,
    createDependentFeaturesService,
    createFakeDependentFeaturesService,
    createFakeAccessService,
    corsOriginMiddleware,
    impactRegister,
} from './internals.js';
import SessionStore from './db/session-store.js';
import metricsHelper from './util/metrics-helper.js';
import type { ReleasePlanMilestoneStrategyWriteModel } from './features/release-plans/release-plan-milestone-strategy-store.js';
import type { IChangeRequestAccessReadModel } from './features/change-request-access-service/change-request-access-read-model.js';
import { EventStore } from './db/event-store.js';
import RoleStore from './db/role-store.js';
import { AccessStore } from './db/access-store.js';
import {
    addAjvSchema,
    type ISchemaValidationErrors,
    validateSchema,
} from './openapi/validate.js';
import type { Counter, Gauge } from './util/metrics/index.js';
import { createCounter, createGauge } from './util/metrics/index.js';
import FakeEventStore from '../test/fixtures/fake-event-store.js';
import type { Subscriber } from './features/user-subscriptions/user-subscriptions-read-model-type.js';
import { UserSubscriptionsReadModel } from './features/user-subscriptions/user-subscriptions-read-model.js';
import { FakeUserSubscriptionsReadModel } from './features/user-subscriptions/fake-user-subscriptions-read-model.js';
import type { IPrivateProjectChecker } from './features/private-project/privateProjectCheckerType.js';
import type { ProjectAccess } from './features/private-project/privateProjectStore.js';
import { FakePrivateProjectChecker } from './features/private-project/fakePrivateProjectChecker.js';
import {
    createFakeProjectReadModel,
    createProjectReadModel,
} from './features/project/createProjectReadModel.js';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from './features/private-project/createPrivateProjectChecker.js';
import type { ProductivityReportMetrics } from './features/productivity-report/productivity-report-view-model.js';
import type { IProjectStats } from './features/project/project-service.js';
import type { IImportService } from './features/export-import-toggles/export-import-service.js';
import type { IContextFieldDto } from './features/context/context-field-store-type.js';
import { SegmentReadModel } from './features/segment/segment-read-model.js';
import type ExportImportService from './features/export-import-toggles/export-import-service.js';
import { FeatureEnvironmentStore } from './db/feature-environment-store.js';
import StrategyStore from './db/strategy-store.js';
import { ChangeRequestAccessReadModel } from './features/change-request-access-service/sql-change-request-access-read-model.js';
import { ImportPermissionsService } from './features/export-import-toggles/import-permissions-service.js';
import FeatureStrategiesStore from './features/feature-toggle/feature-toggle-strategies-store.js';
import TagStore from './db/tag-store.js';
import FeatureToggleStore from './features/feature-toggle/feature-toggle-store.js';
import FeatureTagStore from './db/feature-tag-store.js';
import ExportImportController from './features/export-import-toggles/export-import-controller.js';
import type { QueryOverride } from './features/client-feature-toggles/client-feature-toggle.controller.js';
import { DELTA_EVENT_TYPES } from './features/client-feature-toggles/delta/client-feature-toggle-delta-types.js';
import type { AdvancedPlaygroundFeatureEvaluationResult } from './features/playground/playground-service.js';
import { advancedPlaygroundViewModel } from './features/playground/playground-view-model.js';
import {
    createAccessReadModel,
    createFakeAccessReadModel,
} from './features/access/createAccessReadModel.js';
import {
    getDefaultStrategy,
    getProjectDefaultStrategy,
} from './features/playground/feature-evaluator/helpers.js';
import { getDbConfig } from '../test/e2e/helpers/database-config.js';
import { testDbPrefix } from '../test/e2e/helpers/database-init.js';
import type { RequestHandler } from 'express';
import { UPDATE_REVISION } from './features/feature-toggle/configuration-revision-service.js';
import type { IFeatureUsageInfo } from './services/version-service.js';
import { defineImpactMetrics } from './features/metrics/impact/define-impact-metrics.js';
import type { IClientInstance } from './types/stores/client-instance-store.js';
import EnvironmentStore from './features/project-environments/environment-store.js';
import ProjectStore from './features/project/project-store.js';
import type { ReleasePlanMilestoneWriteModel } from './features/release-plans/release-plan-milestone.js';
import { FakeChangeRequestAccessReadModel } from './features/change-request-access-service/fake-change-request-access-read-model.js';
import { fakeImpactMetricsResolver } from '../test/fixtures/fake-impact-metrics.js';
import { register as defaultMetricsRegister } from 'prom-client';

export async function initialServiceSetup(
    { authentication }: Pick<IUnleashConfig, 'authentication'>,
    {
        userService,
        apiTokenService,
    }: Pick<IUnleashServices, 'userService' | 'apiTokenService'>,
) {
    await userService.initAdminUser(authentication);
    if (authentication.initApiTokens.length > 0) {
        await apiTokenService.initApiTokens(authentication.initApiTokens);
    }
}
export type UnleashFactoryMethods = {
    // Factory methods: useful for testing
    createDb: (config: IUnleashConfig) => Db;
    createStores: (config: IUnleashConfig, db: Db) => IUnleashStores;
    createServices: (
        stores: IUnleashStores,
        config: IUnleashConfig,
        db: Db,
    ) => IUnleashServices;
    createSessionDb: (config: IUnleashConfig, db: Db) => RequestHandler;
    createMetricsMonitor: () => MetricsMonitor;
};
export async function createApp(
    config: IUnleashConfig,
    startApp: boolean,
    fm: UnleashFactoryMethods = {
        createDb,
        createStores,
        createServices,
        createSessionDb: sessionDb,
        createMetricsMonitor,
    },
): Promise<IUnleash> {
    // Database dependencies (stateful)
    const logger = config.getLogger('server-impl.js');
    const serverVersion = config.enterpriseVersion ?? version;
    const db = fm.createDb(config);
    const stores = fm.createStores(config, db);
    await compareAndLogPostgresVersion(config, stores.settingStore);
    const services = fm.createServices(stores, config, db);
    await initialServiceSetup(config, services);

    if (!config.disableScheduler) {
        scheduleServices(services, config);
    }

    defineImpactMetrics(config.flagResolver);
    const metricsMonitor = fm.createMetricsMonitor();
    const unleashSession = fm.createSessionDb(config, db);

    const stopUnleash = async (server?: StoppableServer) => {
        logger.info('Shutting down Unleash...');
        if (server) {
            const stopServer = promisify(server.stop);
            await stopServer();
        }
        if (typeof config.shutdownHook === 'function') {
            try {
                await config.shutdownHook();
            } catch (e) {
                logger.error('Failure when executing shutdown hook', e);
            }
        }
        services.schedulerService.stop();
        services.addonService.destroy();
        await db.destroy();
    };

    if (!config.server.secret) {
        const secret = await stores.settingStore.get<string>('unleash.secret');
        config.server.secret = secret!;
    }
    const app = await getApp(config, stores, services, unleashSession, db);

    await metricsMonitor.startMonitoring(
        config,
        stores,
        serverVersion,
        config.eventBus,
        services.instanceStatsService,
        services.schedulerService,
        db,
    );
    const unleash: Omit<IUnleash, 'stop'> = {
        stores,
        eventBus: config.eventBus,
        services,
        app,
        config,
        version: serverVersion,
    };

    if (config.import.file) {
        await services.importService.importFromFile(
            config.import.file,
            config.import.project,
            config.import.environment,
        );
    }

    if (
        config.environmentEnableOverrides &&
        config.environmentEnableOverrides?.length > 0
    ) {
        await services.environmentService.overrideEnabledProjects(
            config.environmentEnableOverrides,
        );
    }

    return new Promise((resolve, reject) => {
        if (startApp) {
            const server = stoppable(
                app.listen(config.listen, () =>
                    logger.info('Unleash has started.', server.address()),
                ),
                config.server.gracefulShutdownTimeout,
            );

            server.keepAliveTimeout = config.server.keepAliveTimeout;
            server.headersTimeout = config.server.headersTimeout;
            server.on('listening', () => {
                resolve({
                    ...unleash,
                    server,
                    stop: () => stopUnleash(server),
                });
            });
            server.on('error', reject);
        } else {
            resolve({ ...unleash, stop: stopUnleash });
        }
    });
}

async function start(
    opts: IUnleashOptions = {},
    fm: UnleashFactoryMethods = {
        createDb,
        createStores,
        createServices,
        createSessionDb: sessionDb,
        createMetricsMonitor,
    },
): Promise<IUnleash> {
    const config = createConfig(opts);
    const logger = config.getLogger('server-impl.js');

    try {
        if (config.db.disableMigration) {
            logger.info('DB migration: disabled');
        } else {
            if (await requiresMigration(config)) {
                logger.info('DB migration: start');
                if (config.flagResolver.isEnabled('migrationLock')) {
                    logger.info('Running migration with lock');
                    const lock = withDbLock(config.db, {
                        lockKey: defaultLockKey,
                        timeout: defaultTimeout,
                        logger,
                    });
                    await lock(migrateDb)(config);
                } else {
                    logger.info('Running migration without lock');
                    await migrateDb(config);
                }

                logger.info('DB migration: end');
            } else {
                logger.info('DB migration: no migration needed');
            }
        }
    } catch (err) {
        logger.error('Failed to migrate db', err);
        throw err;
    }

    const unleash = await createApp(config, true, fm);
    if (config.server.gracefulShutdownEnable) {
        registerGracefulShutdown(unleash, logger);
    }
    return unleash;
}

async function create(
    opts: IUnleashOptions,
    fm: UnleashFactoryMethods = {
        createDb,
        createStores,
        createServices,
        createSessionDb: sessionDb,
        createMetricsMonitor,
    },
): Promise<IUnleash> {
    const config = createConfig(opts);
    const logger = config.getLogger('server-impl.js');

    try {
        if (config.db.disableMigration) {
            logger.info('DB migrations disabled');
        } else {
            await migrateDb(config);
        }
    } catch (err) {
        logger.error('Failed to migrate db', err);
        throw err;
    }
    return createApp(config, false, fm);
}

export {
    start,
    create,
    scheduleServices,
    createDb,
    resetDb,
    getDbConfig,
    testDbPrefix,
    Controller,
    LogLevel,
    withRollbackTransaction,
    withTransactional,
    createClientFeatureToggleDelta,
    CRUDStore,
    ImportTogglesStore,
    ALL_PROJECTS,
    ALL,
    isAllProjects,
    extractAuditInfoFromUser,
    createTestConfig,
    NoAuthUser,
    defaultFromRow,
    defaultToRow,
    isDefined,
    parseEnvVarBoolean,
    querySchema,
    basePaginationParameters,
    migrateDb,
    flattenPayload,
    randomId,
    CUSTOM_ROOT_ROLE_TYPE,
    getVariantValue,
    UPDATE_DELTA,
    UPDATE_REVISION,
    applyGenericQueryParams,
    normalizeQueryParams,
    parseSearchOperatorValue,
    createEventsService,
    SessionStore,
    createAccessService,
    metricsHelper,
    DB_TIME,
    EventStore,
    FakeEventStore,
    fakeImpactMetricsResolver,
    createChangeRequestAccessReadModel,
    createFeatureToggleService,
    createProjectService,
    createFakeProjectService,
    findParam,
    RoleStore,
    AccessStore,
    validateSchema,
    addAjvSchema,
    createCounter,
    createGauge,
    UserSubscriptionsReadModel,
    FakeUserSubscriptionsReadModel,
    FakePrivateProjectChecker,
    FakeChangeRequestAccessReadModel,
    createFakeProjectReadModel,
    createFakePrivateProjectChecker,
    createProjectReadModel,
    createPrivateProjectChecker,
    createFakeInstanceStatsService,
    createInstanceStatsService,
    SegmentReadModel,
    FeatureEnvironmentStore,
    ChangeRequestAccessReadModel,
    StrategyStore,
    ImportPermissionsService,
    FeatureStrategiesStore,
    TagStore,
    FeatureToggleStore,
    createTagTypeService,
    createContextService,
    createExportImportTogglesService,
    FeatureTagStore,
    ExportImportController,
    conditionalMiddleware,
    DELTA_EVENT_TYPES,
    createKnexTransactionStarter,
    createPlaygroundService,
    advancedPlaygroundViewModel,
    withFakeTransactional,
    createAccessReadModel,
    createFakeAccessService,
    createFakeAccessReadModel,
    createFakeSegmentService,
    createSegmentService,
    createFakeFeatureToggleService,
    createFakeEventsService,
    createDependentFeaturesService,
    createFakeDependentFeaturesService,
    getProjectDefaultStrategy,
    getDefaultStrategy,
    corsOriginMiddleware,
    ApiTokenType,
    impactRegister,
    EnvironmentStore,
    ProjectStore,
    defaultMetricsRegister,
};

export type {
    Db,
    Row,
    CrudStoreConfig,
    IUnleashConfig,
    IUnleashOptions,
    IUnleashServices,
    IUnleashStores,
    LogProvider,
    IImportTogglesStore,
    WithRollbackTransaction,
    WithTransactional,
    IRole,
    Store,
    Logger,
    IProjectStats,
    AdvancedPlaygroundFeatureEvaluationResult,
    ICreateUserWithRole,
    ICreateUser,
    IUpdateUser,
    IUserUpdateFields,
    IUserLookup,
    FromQueryParams,
    ISegmentService,
    IAccessReadModel,
    IStatMonthlyTrafficUsage,
    BasePaginationParameters,
    AccessReadModel,
    Constraint,
    ClientFeatureToggleDelta,
    DeltaEvent,
    IQueryParam,
    PatService,
    IRoleWithPermissions,
    TransactionCreator,
    UnleashTransaction,
    ReleasePlanMilestoneWriteModel,
    ReleasePlanMilestoneStrategyWriteModel,
    IChangeRequestAccessReadModel,
    IRoleWithProject,
    ISchemaValidationErrors,
    IImportService,
    IContextFieldDto,
    Gauge,
    Counter,
    Subscriber,
    ProjectAccess,
    IPrivateProjectChecker,
    ProductivityReportMetrics,
    ExportImportService,
    QueryOverride,
    IUserPermission,
    IFeatureUsageInfo,
    IClientInstance,
};
export * from './openapi/index.js';
export * from './types/index.js';
export * from './error/index.js';
export * from './util/index.js';
export * from './services/index.js';
export * as eventtypes from './events/index.js';
export * as interfaces from './interfaces/index.js';
