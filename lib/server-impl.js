'use strict';

const { EventEmitter } = require('events');

const migrator = require('../migrator');
const getApp = require('./app');

const { startMonitoring } = require('./metrics');
const { createStores } = require('./db');
const { createOptions } = require('./options');
const StateService = require('./state-service');
const User = require('./user');
const AuthenticationRequired = require('./authentication-required');
const { addEventHook } = require('./event-hook');

async function createApp(options) {
    // Database dependencies (stateful)
    const logger = options.getLogger('server-impl.js');
    const eventBus = new EventEmitter();
    const stores = createStores(options, eventBus);

    const config = Object.assign(
        {
            stores,
            eventBus,
            logFactory: options.getLogger, // TODO: remove in v4.x
        },
        options
    );

    const app = getApp(config);
    startMonitoring(
        options.serverMetrics,
        eventBus,
        stores.eventStore,
        stores.clientMetricsStore
    );

    if (typeof config.eventHook === 'function') {
        addEventHook(config.eventHook, stores.eventStore);
    }

    const stateService = new StateService(config);
    config.stateService = stateService;
    if (config.importFile) {
        await stateService.importFile({
            file: config.importFile,
            dropBeforeImport: config.dropBeforeImport,
            userName: 'import',
        });
    }

    const server = app.listen(options.listen, () =>
        logger.info('Unleash has started.', server.address())
    );

    return new Promise((resolve, reject) => {
        server.on('listening', () =>
            resolve({
                app,
                server,
                eventBus,
                stateService,
            })
        );
        server.on('error', reject);
    });
}

async function start(opts) {
    const options = createOptions(opts);
    const logger = options.getLogger('server-impl.js');

    try {
        await migrator(options);
    } catch (err) {
        logger.error('Failed to migrate db', err);
        throw err;
    }

    return createApp(options);
}

module.exports = {
    start,
    User,
    AuthenticationRequired,
};
