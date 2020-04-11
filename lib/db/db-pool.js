'use strict';

const knex = require('knex');

module.exports.createDb = function({
    db,
    poolMin = 2,
    poolMax = 20,
    databaseSchema,
}) {
    return knex({
        client: 'pg',
        connection: db,
        pool: { min: poolMin, max: poolMax },
        searchPath: databaseSchema,
    });
};
