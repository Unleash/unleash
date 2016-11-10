'use strict';

const DBMigrate = require('db-migrate');
const path = require('path');

function findUnleashApiRoot () {
    try {
        return path.dirname(require.resolve('unleash-api/package.json'));
    } catch (e) {}
    try {
        return path.dirname(require.resolve('../unleash-api/package.json'));
    } catch (e) {}
    return process.cwd();
}

function migrateDb (dbUri) {
    const dbmigrate = DBMigrate.getInstance(true, {
        cwd: findUnleashApiRoot(),
        config: { custom: dbUri },
        env: 'custom' }
    );
    return dbmigrate.up();
}

module.exports = migrateDb;
