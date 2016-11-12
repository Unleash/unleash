'use strict';

const knex   = require('knex');

module.exports.createDb = function (databaseConnection, schema = 'public') {
    const db = knex({
        client: 'pg',
        connection: databaseConnection,
        pool: { min: 2, max: 20 },
        searchPath: schema,
    });

    return db;
};
