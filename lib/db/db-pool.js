'use strict';

const knex   = require('knex');

module.exports.createDb = function ({ databaseUri, poolMin = 2, poolMax = 20, databaseSchema = 'public' }) {
    const db = knex({
        client: 'pg',
        connection: databaseUri,
        pool: { min: poolMin, max: poolMax },
        searchPath: databaseSchema,
    });

    return db;
};
