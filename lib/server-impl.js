'use strict';

const logger = require('./logger');
const migrator = require('../migrator');
const { createStores } = require('./db');
const getApp = require('./lib/app');

const DEFAULT_OPTIONS = {
    databaseUri: process.env.DATABASE_URL || 'postgres://unleash_user:passord@localhost:5432/unleash',
    port: process.env.HTTP_PORT || process.env.PORT || 4242,
    baseUriPath: process.env.BASE_URI_PATH || '',
};

function createApp (options) {
    // Database dependecies (statefull)
    const stores = createStores(options);

    const config = {
        baseUriPath: options.baseUriPath,
        port: options.port,
        publicFolder: options.publicFolder,
        stores,
    };

    const app = getApp(config);
    const server = app.listen(app.get('port'), () => {
        logger.info(`Unleash started on ${app.get('port')}`);
    });
    return { app, server };
}

function start (opts) {
    const options = Object.assign({}, DEFAULT_OPTIONS, opts);

    if (!options.databaseUri) {
        throw new Error('You must either pass databaseUri option or set environemnt variable DATABASE_URL');
    }

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
