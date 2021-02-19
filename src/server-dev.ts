'use strict';

import unleash from './lib/server-impl';

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
    session: {
        db: true
    },
    versionCheck: {
        enable: false,
    }
});
