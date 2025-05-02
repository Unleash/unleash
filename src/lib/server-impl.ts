import stoppable, { type StoppableServer } from 'stoppable';
import { promisify } from 'util';
import version from './util/version.js';
import { migrateDb } from '../migrator.js';
import getApp from './app.js';
import { createMetricsMonitor } from './metrics.js';
import { createStores } from './db/index.js';
import { createConfig } from './create-config.js';
import registerGracefulShutdown from './util/graceful-shutdown.js';
import { createDb } from './db/db-pool.js';
import sessionDb from './middleware/session-db.js';
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
    type TransactionCreator,
    type UnleashTransaction,
    type WithRollbackTransaction,
    withRollbackTransaction,
    type WithTransactional,
    withTransactional,
} from './db/transaction.js';
import Controller from './routes/controller.js';
import { createClientFeatureToggleDelta } from './features/client-feature-toggles/delta/createClientFeatureToggleDelta.js';
import { CRUDStore } from './db/crud/crud-store.js';
import type { CrudStoreConfig } from './db/crud/crud-store.js';
import { Logger, LogLevel, type LogProvider } from './logger.js';
import { ImportTogglesStore } from './features/export-import-toggles/import-toggles-store.js';
import { ALL_PROJECTS, CUSTOM_ROOT_ROLE_TYPE } from './util/constants.js';
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
} from './types/stores/access-store.js';
import { createTestConfig } from '../test/config/test-config.js';
import NoAuthUser from './types/no-auth-user.js';
import { ALL, ApiTokenType, isAllProjects } from './types/models/api-token.js';
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
    createEventsService,
    createFeatureToggleService,
    DB_TIME,
} from './internals.js';
import SessionStore from './db/session-store.js';
import metricsHelper from './util/metrics-helper.js';
import type { ReleasePlanMilestoneWriteModel } from './features/release-plans/release-plan-milestone-store.js';
import type { ReleasePlanMilestoneStrategyWriteModel } from './features/release-plans/release-plan-milestone-strategy-store.js';
import type { IChangeRequestAccessReadModel } from './features/change-request-access-service/change-request-access-read-model.js';
import EventStore from './db/event-store.js';

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

export async function createApp(
    config: IUnleashConfig,
    startApp: boolean,
): Promise<IUnleash> {
    // Database dependencies (stateful)
    const logger = config.getLogger('server-impl.js');
    const serverVersion = config.enterpriseVersion ?? version;
    const db = createDb(config);
    const stores = createStores(config, db);
    await compareAndLogPostgresVersion(config, stores.settingStore);
    const services = createServices(stores, config, db);
    await initialServiceSetup(config, services);

    if (!config.disableScheduler) {
        await scheduleServices(services, config);
    }

    const metricsMonitor = createMetricsMonitor();
    const unleashSession = sessionDb(config, db);

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

async function start(opts: IUnleashOptions = {}): Promise<IUnleash> {
    const config = createConfig(opts);
    const logger = config.getLogger('server-impl.js');

    try {
        if (config.db.disableMigration) {
            logger.info('DB migration: disabled');
        } else {
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
        }
    } catch (err) {
        logger.error('Failed to migrate db', err);
        throw err;
    }

    const unleash = await createApp(config, true);
    if (config.server.gracefulShutdownEnable) {
        registerGracefulShutdown(unleash, logger);
    }
    return unleash;
}

async function create(opts: IUnleashOptions): Promise<IUnleash> {
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
    return createApp(config, false);
}

export {
    start,
    create,
    createDb,
    Controller,
    Logger,
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
    ApiTokenType,
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
    applyGenericQueryParams,
    normalizeQueryParams,
    parseSearchOperatorValue,
    createEventsService,
    SessionStore,
    createAccessService,
    metricsHelper,
    DB_TIME,
    EventStore,
    createChangeRequestAccessReadModel,
    createFeatureToggleService,
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
};
export * from './openapi/index.js';
export * from './types/index.js';
export * from './error/index.js';
export * from './util/index.js';
export * from './services/index.js';
