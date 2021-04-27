'use strict';

require('db-migrate-shared').log.setLogLevel('error');

const { getInstance } = require('db-migrate');

function migrateDb({ db }) {
    const custom = { ...db };
    const dbmigrate = getInstance(true, {
        cwd: __dirname,
        config: { custom },
        env: 'custom',
    });
    return dbmigrate.up();
}

module.exports = migrateDb;
