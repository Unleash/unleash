'use strict';

const unleash = require('./lib/server-impl');

unleash.start({
    db: {
        user: 'unleash_user',
        password: 'passord',
        host: 'localhost',
        port: 5432,
        database: 'unleash',
        ssl: false,
    },
    enableRequestLogger: true,
    enableOAS: true,
});
