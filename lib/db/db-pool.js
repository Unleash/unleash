'use strict';

const knex   = require('knex');

module.exports.createDb = function ({ databaseUrl, poolMin = 2, poolMax = 20, databaseSchema = 'public' }) {
    const db = knex({
        client: 'pg',
        connection: databaseUrl,
        pool: { min: poolMin, max: poolMax },
        searchPath: databaseSchema,
    });

    return db;
};
