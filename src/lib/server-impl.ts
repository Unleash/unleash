import stoppable, { StoppableServer } from 'stoppable';
import { promisify } from 'util';
import version from './util/version';
import { migrateDb } from '../migrator';
import getApp from './app';
import { createMetricsMonitor } from './metrics';
import { createStores } from './db';
import { createServices } from './services';
import { createConfig } from './create-config';
import { addEventHook } from './event-hook';
import registerGracefulShutdown from './util/graceful-shutdown';
import { createDb } from './db/db-pool';
import sessionDb from './middleware/session-db';
// Types
import { IUnleash } from './types/core';
import { IUnleashConfig, IUnleashOptions, IAuthType } from './types/option';
import { IUnleashServices } from './types/services';
import User, { IUser } from './types/user';
import ApiUser from './types/api-user';
import { Logger, LogLevel } from './logger';
import AuthenticationRequired from './types/authentication-required';
import Controller from './routes/controller';
import { IAuthRequest } from './routes/unleash-types';
import * as permissions from './types/permissions';
import * as eventType from './types/events';
import { RoleName } from './types/model';
import { SimpleAuthSettings } from './types/settings/simple-auth-settings';

async function createApp(
    config: IUnleashConfig,
    startApp: boolean,
): Promise<IUnleash> {
    // Database dependencies (stateful)
    const logger = config.getLogger('server-impl.js');
    const serverVersion = version;
    const db = createDb(config);
    const stores = createStores(config, db);
    const services = createServices(stores, config);

    const metricsMonitor = createMetricsMonitor();
    const unleashSession = sessionDb(config, db);

    const stopUnleash = async (server?: StoppableServer) => {
        logger.info('Shutting down Unleash...');
        if (server) {
            const stopServer = promisify(server.stop);
            await stopServer();
        }
        metricsMonitor.stopMonitoring();
        stores.clientInstanceStore.destroy();
        services.clientMetricsServiceV2.destroy();
        await db.destroy();
    };

    if (!config.server.secret) {
        const secret = await stores.settingStore.get('unleash.secret');
        // eslint-disable-next-line no-param-reassign
        config.server.secret = secret;
    }
    const app = await getApp(config, stores, services, unleashSession);

    if (typeof config.eventHook === 'function') {
        addEventHook(config.eventHook, stores.eventStore);
    }
    await metricsMonitor.startMonitoring(
        config,
        stores,
        serverVersion,
        config.eventBus,
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
        await services.stateService.importFile({
            file: config.import.file,
            dropBeforeImport: config.import.dropBeforeImport,
            userName: 'import',
            keepExisting: config.import.keepExisting,
        });
    }

    if (config.environmentEnableOverrides?.length > 0) {
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
            logger.debug('DB migration: start');
            await migrateDb(config);
            logger.debug('DB migration: end');
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

// Module exports
export {
    start,
    create,
    permissions,
    eventType,
    Controller,
    AuthenticationRequired,
    User,
    ApiUser,
    LogLevel,
    RoleName,
    IAuthType,
};

export default {
    start,
    create,
};

export type {
    Logger,
    IUnleash,
    IUnleashOptions,
    IUnleashConfig,
    IUser,
    IUnleashServices,
    IAuthRequest,
    SimpleAuthSettings,
};
