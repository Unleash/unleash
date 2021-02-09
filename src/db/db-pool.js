'use strict';

const knex = require('knex');

module.exports.createDb = function({ db, databaseSchema, getLogger }) {
    const logger = getLogger('db-pool.js');
    return knex({
        client: 'pg',
        version: db.version,
        connection: db,
        pool: db.pool,
        searchPath: databaseSchema,
        log: {
            debug: msg => logger.debug(msg),
            info: msg => logger.info(msg),
            warn: msg => logger.warn(msg),
            error: msg => logger.error(msg),
        },
    });
};
