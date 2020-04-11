'use strict';

const knex = require('knex');

module.exports.createDb = function({
    db,
    poolMin = 2,
    poolMax = 20,
    databaseSchema,
    getLogger,
}) {
    const logger = getLogger('db-pool.js');
    return knex({
        client: 'pg',
        connection: db,
        pool: { min: poolMin, max: poolMax },
        searchPath: databaseSchema,
        log: {
            debug: msg => logger.debug(msg),
            info: msg => logger.info(msg),
            warn: msg => logger.warn(msg),
            error: msg => logger.error(msg),
        },
    });
};
