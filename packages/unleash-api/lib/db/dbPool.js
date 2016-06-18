'use strict';
const knex   = require('knex');

module.exports = function(databaseConnection) {
    return knex({
        client: 'pg',
        connection: databaseConnection,
        pool: { min: 2, max: 20 }
    });
};
