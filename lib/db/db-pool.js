/* eslint-disable no-negated-condition */
'use strict';

const knex = require('knex');

module.exports.createDb = function({
    databaseUrl,
    poolMin = 2,
    poolMax = 20,
    databaseSchema = 'public',
}) {
    let db;

    if (databaseUrl.indexOf('sqlite3') !== -1) {
        db = knex({
            client: 'sqlite3',
            connection: {
                filename: './dev.sqlite3',
                schema: 'unleash',
            },
            useNullAsDefault: true,
        });
    } else {
        db = knex({
            client: 'pg',
            connection: databaseUrl,
            pool: { min: poolMin, max: poolMax },
            searchPath: databaseSchema,
        });
    }

    return db;
};
