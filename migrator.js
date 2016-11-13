'use strict';

const { getInstance } = require('db-migrate');
const parseDbUrl = require('parse-database-url');

function migrateDb ({ databaseUri, databaseSchema = 'public' }) {
    const custom = parseDbUrl(databaseUri);
    custom.schema = databaseSchema;
    const dbmigrate = getInstance(true, {
        cwd: __dirname,
        config: { custom },
        env: 'custom' }
    );
    return dbmigrate.up();
}

module.exports = migrateDb;
