'use strict';

import unleash from './lib/server-impl';
import { createConfig } from "./lib/create-config";

unleash.start(createConfig({
    db: {
        user: 'unleash_user',
        password: 'passord',
        host: 'localhost',
        port: 5432,
        database: 'unleash',
        ssl: false,
    },
    server: {
        enableRequestLogger: true,
    },
    enableOAS: true,
    versionCheck: {
        enable: false,
    },
}));
