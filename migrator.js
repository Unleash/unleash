'use strict';

const DBMigrate = require('db-migrate');
const path = require('path');
const parseDbUrl = require('parse-database-url');

function migrateDb (dbUrl, schema = "public") {
    const custom = parseDbUrl(dbUrl);
    custom.schema = schema;
    const dbmigrate = DBMigrate.getInstance(true, {
        cwd: __dirname,
        config: { custom },
        env: 'custom' }
    );
    return dbmigrate.up();
}

module.exports = migrateDb;