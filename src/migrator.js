'use strict';

require('db-migrate-shared').log.setLogLevel('error');

const { getInstance } = require('db-migrate');

function getDbInstance({ db, databaseSchema = 'public' }) {
    const custom = { ...db, schema: databaseSchema };
    return getInstance(true, {
        cwd: __dirname,
        config: { custom },
        env: 'custom',
    });
}

async function up(options) {
    return getDbInstance(options).up();
}

async function reset(options) {
    return getDbInstance(options).reset();
}

module.exports = {
    up,
    reset,
};
