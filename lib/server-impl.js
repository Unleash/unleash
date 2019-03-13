'use strict';

const { EventEmitter } = require('events');

const logFactory = require('./logger');
const logger = require('./logger')('server-impl.js');
const migrator = require('../migrator');
const getApp = require('./app');

const { startMonitoring } = require('./metrics');
const { createStores } = require('./db');
const { createOptions } = require('./options');
const StateService = require('./state-service');
const User = require('./user');
const AuthenticationRequired = require('./authentication-required');

async function createApp(options) {
    // Database dependecies (statefull)
    const stores = createStores(options);
    const eventBus = new EventEmitter();

    const config = Object.assign(
        {
            stores,
            eventBus,
            logFactory,
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

    const stateService = new StateService(config);
    config.stateService = stateService;
    if (config.importFile) {
        await stateService.importFile({
            importFile: config.importFile,
            dropBeforeImport: config.dropBeforeImport,
            userName: 'importer',
        });
    }

    const server = app.listen({ port: options.port, host: options.host }, () =>
        logger.info(`Unleash started on port ${server.address().port}`)
    );

    return await new Promise((resolve, reject) => {
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
