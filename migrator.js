'use strict';

const DBMigrate = require('db-migrate');
const path = require('path');

function migrateDb (dbUri) {
    console.log(dbUri);
    const dbmigrate = DBMigrate.getInstance(true, {
        cwd: __dirname,
        config: { "custom": dbUri},
        env: 'custom' }
    );
    return dbmigrate.up();
}

module.exports = migrateDb;