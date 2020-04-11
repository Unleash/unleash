'use strict';

const unleash = require('./lib/server-impl');

// DATABASE_URL=postgres://unleash_user:passord@localhost:5432/unleash?ssl=true
unleash.start({
    db: {
        user: 'unleash_user',
        password: 'passord',
        host: 'localhost',
        port: 5432,
        database: 'unleash',
        ssl: true,
    },
    enableRequestLogger: true,
});
