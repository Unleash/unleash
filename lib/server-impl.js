'use strict';

const { EventEmitter } = require('events');

const logger = require('./logger')('server-impl.js');
const migrator = require('../migrator');
const getApp = require('./app');

const { startMonitoring } = require('./metrics');
const { createStores } = require('./db');
const { createOptions } = require('./options');
const User = require('./user');
const AuthenticationRequired = require('./authentication-required');

function createApp(options) {
    // Database dependecies (statefull)
    const stores = createStores(options);
    const eventBus = new EventEmitter();

    const config = Object.assign(
        {
            stores,
            eventBus,
        },
        options
    );

    const app = getApp(config);
    const server = app.listen(app.get('port'), options.host, () => {
        logger.info(`Unleash started on ${app.get('port')}`);
    });

    startMonitoring(options.serverMetrics, eventBus);

    return { app, server, eventBus };
}

function start(opts) {
    const options = createOptions(opts);

    return migrator({ databaseUrl: options.databaseUrl })
        .catch(err => logger.error('failed to migrate db', err))
        .then(() => createApp(options))
        .catch(err => logger.error('failed creating app', err));
}

module.exports = {
    start,
    User,
    AuthenticationRequired,
};
