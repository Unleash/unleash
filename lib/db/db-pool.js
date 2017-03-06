'use strict';

const knex = require('knex');

module.exports.createDb = function ({ databaseUrl, poolMin = 2, poolMax = 20, databaseSchema = 'public', timezone = 'UTC' }) {
    const db = knex({
        client: 'pg',
        connection: databaseUrl,
        pool: {
            min: poolMin,
            max: poolMax,
            afterCreate: (connection, callback) => {
                connection.query(`SET TIMEZONE TO ${timezone};`, (err) => {
                    callback(err, connection);
                });
            },
        },
        searchPath: databaseSchema,
    });

    return db;
};
