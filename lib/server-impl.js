'use strict';

const { EventEmitter } = require('events');

const logger = require('./logger');
const migrator = require('../migrator');
const getApp = require('./app');
const events = require('./events');

const { startMonitoring } = require('./metrics');
const { createStores } = require('./db');
const { createOptions } = require('./options');

function createApp (options) {
    // Database dependecies (statefull)
    const stores = createStores(options);
    const eventBus = new EventEmitter();

    const config = {
        baseUriPath: options.baseUriPath,
        serverMetrics: options.serverMetrics,
        port: options.port,
        publicFolder: options.publicFolder,
        stores,
        eventBus,
    };

    const app = getApp(config);
    const server = app.listen(app.get('port'), () => {
        logger.info(`Unleash started on ${app.get('port')}`);
    });

    startMonitoring(options.serverMetrics, eventBus);

    return { app, server, eventBus };
}

function start (opts) {
    const options = createOptions(opts);

    return migrator({ databaseUri: options.databaseUri })
        .catch(err => logger.error('failed to migrate db', err))
        .then(() => createApp(options))
        .catch(err => logger.error('failed creating app', err));
}

process.on('uncaughtException', err => {
    logger.error('Uncaught Exception:', err.message);
    logger.error(err.stack);
});

module.exports = {
    start,
};
