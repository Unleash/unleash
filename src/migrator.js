'use strict';

require('db-migrate-shared').log.setLogLevel('error');

const { getInstance } = require('db-migrate');

async function migrateDb({ db }) {
    const custom = { ...db, connectionTimeoutMillis: 10000 };

    const dbm = getInstance(true, {
        cwd: __dirname,
        config: { custom },
        env: 'custom',
    });

    return dbm.up();
}

module.exports = migrateDb;
