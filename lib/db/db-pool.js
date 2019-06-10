/* eslint-disable no-negated-condition */
'use strict';

const knex = require('knex');

module.exports.createDb = function(config) {
    const db = config.database;

    if (db) {
        return knex(db);
    } else {
        throw new Error(`config did not contain database entry`);
    }
};
