'use strict';

// const unleash = require('unleash-server');
const unleash = require('../lib/server-impl.js');

const enableGoogleOauth = require('./google-auth-hook');

unleash
    .start({
        databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
        adminAuthentication: 'custom',
        preRouterHook: enableGoogleOauth,
    })
    .then(server => {
        console.log(
            `Unleash started on http://localhost:${server.app.get('port')}`
        );
    });
