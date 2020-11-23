'use strict';

const { EventEmitter } = require('events');

const migrator = require('../migrator');
const getApp = require('./app');

const { startMonitoring } = require('./metrics');
const { createStores } = require('./db');
const { createServices } = require('./services');
const { createOptions } = require('./options');
const User = require('./user');
const permissions = require('./permissions');
const AuthenticationRequired = require('./authentication-required');
const { addEventHook } = require('./event-hook');
const eventType = require('./event-type');

async function createApp(options) {
    // Database dependencies (stateful)
    const logger = options.getLogger('server-impl.js');
    const eventBus = new EventEmitter();
    const stores = createStores(options, eventBus);
    const services = createServices(stores, options, eventBus);
    const secret = await stores.settingStore.get('unleash.secret');

    const config = {
        stores,
        eventBus,
        secret,
        logFactory: options.getLogger, // TODO: remove in v4.x

        ...options,
    };

    const app = getApp(config);
    startMonitoring(config);

    if (typeof config.eventHook === 'function') {
        addEventHook(config.eventHook, stores.eventStore);
    }

    if (config.importFile) {
        await services.stateService.importFile({
            file: config.importFile,
            dropBeforeImport: config.dropBeforeImport,
            userName: 'import',
            keepExisting: config.importKeepExisting,
        });
    }

    return new Promise((resolve, reject) => {
        const payload = {
            app,
            config,
            stores,
            services,
            eventBus,
        };

        if (options.start) {
            const server = app.listen(options.listen, () =>
                logger.info('Unleash has started.', server.address()),
            );
            server.keepAliveTimeout = options.keepAliveTimeout;
            server.headersTimeout = options.headersTimeout;
            server.on('listening', () => {
                resolve({ ...payload, server });
            });
            server.on('error', reject);
        } else {
            resolve({ ...payload });
        }
    });
}

async function start(opts) {
    const options = createOptions(opts);
    const logger = options.getLogger('server-impl.js');

    try {
        if (options.disableDBMigration) {
            logger.info('DB migrations disabled');
        } else {
            await migrator(options);
        }
    } catch (err) {
        logger.error('Failed to migrate db', err);
        throw err;
    }

    return createApp(options);
}

async function create(opts) {
    return start({ ...opts, start: false });
}

module.exports = {
    start,
    create,
    User,
    AuthenticationRequired,
    permissions,
    eventType,
};
