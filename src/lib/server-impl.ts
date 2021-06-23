import EventEmitter from 'events';
import stoppable, { StoppableServer } from 'stoppable';
import { promisify } from 'util';
import { IUnleash } from './types/core';
import { IUnleashConfig, IUnleashOptions } from './types/option';
import version from './util/version';
import migrator from '../migrator';
import getApp from './app';
import { createMetricsMonitor } from './metrics';
import { createStores } from './db';
import { createServices } from './services';
import { createConfig } from './create-config';
import User from './types/user';

import * as permissions from './types/permissions';
import AuthenticationRequired from './types/authentication-required';
import * as eventType from './types/events';
import { addEventHook } from './event-hook';
import registerGracefulShutdown from './util/graceful-shutdown';

async function createApp(
    config: IUnleashConfig,
    startApp: boolean,
): Promise<IUnleash> {
    // Database dependencies (stateful)
    const logger = config.getLogger('server-impl.js');
    const serverVersion = version;
    const eventBus = new EventEmitter();
    const stores = createStores(config, eventBus);
    const services = createServices(stores, config);
    const metricsMonitor = createMetricsMonitor();

    const stopUnleash = async (server?: StoppableServer) => {
        logger.info('Shutting down Unleash...');
        if (server) {
            const stopServer = promisify(server.stop);
            await stopServer();
        }
        metricsMonitor.stopMonitoring();
        stores.clientInstanceStore.destroy();
        stores.clientMetricsStore.destroy();
        await stores.db.destroy();
    };

    if (!config.server.secret) {
        const secret = await stores.settingStore.get('unleash.secret');
        // eslint-disable-next-line no-param-reassign
        config.server.secret = secret;
    }
    const app = getApp(config, stores, services, eventBus);

    if (typeof config.eventHook === 'function') {
        addEventHook(config.eventHook, stores.eventStore);
    }
    metricsMonitor.startMonitoring(config, stores, serverVersion, eventBus);
    const unleash: Omit<IUnleash, 'stop'> = {
        stores,
        eventBus,
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function start(opts: IUnleashOptions = {}): Promise<IUnleash> {
    const config = createConfig(opts);
    const logger = config.getLogger('server-impl.js');

    try {
        if (config.db.disableMigration) {
            logger.info('DB migrations disabled');
        } else {
            await migrator(config);
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function create(opts: IUnleashOptions): Promise<IUnleash> {
    const config = createConfig(opts);
    const logger = config.getLogger('server-impl.js');

    try {
        if (config.db.disableMigration) {
            logger.info('DB migrations disabled');
        } else {
            await migrator(config);
        }
    } catch (err) {
        logger.error('Failed to migrate db', err);
        throw err;
    }
    return createApp(config, false);
}
const serverImpl = {
    start,
    create,
    User,
    AuthenticationRequired,
    permissions,
    eventType,
};
export default serverImpl;
module.exports = serverImpl;
