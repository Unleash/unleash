'use strict';

const unleash = require('./lib/server-impl');

unleash.start({
    db: {
        user: 'postgres',
        password: 'password',
        host: 'localhost',
        port: 54320,
        database: 'postgres',
        ssl: false,
    },
    enableRequestLogger: true,
    enableOAS: true,
});
