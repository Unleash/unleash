/* eslint-disable no-negated-condition */
'use strict';

const knex = require('knex');

module.exports.createDb = function() {
    const env = process.env.NODE_ENV || 'development';
    const dbConnectionInfo = require('../../knexfile');

    if (dbConnectionInfo[env]) {
        return knex(dbConnectionInfo[env]);
    } else {
        throw new Error(`knexfile did not contain entry for ${env}`);
    }
};
