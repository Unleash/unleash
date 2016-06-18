'use strict';
const logger = require('./lib/logger');
const defaultDatabaseUri = process.env.DATABASE_URL;

function start(options) {
    options = options || {};

    const db = require('./lib/db/dbPool')(options.databaseUri || defaultDatabaseUri);
    // Database dependecies (statefull)
    const eventDb = require('./lib/db/event')(db);
    const EventStore = require('./lib/eventStore');
    const eventStore = new EventStore(eventDb);
    const featureDb = require('./lib/db/feature')(db, eventStore);
    const strategyDb = require('./lib/db/strategy')(db, eventStore);

    const config = {
        baseUriPath: process.env.BASE_URI_PATH || '',
        port: process.env.HTTP_PORT || process.env.PORT || 4242,
        db,
        eventDb,
        eventStore,
        featureDb,
        strategyDb,
        publicFolder: options.publicFolder
    };

    const app = require('./app')(config);

    const server = app.listen(app.get('port'), () => {
        logger.info(`unleash started on ${app.get('port')}`);
    });

    return {
        app,
        server,
        config
    };
}

process.on('uncaughtException', err => {
    logger.error('Uncaught Exception:', err.message);
    logger.error(err.stack);
});

module.exports = {
    start
};
