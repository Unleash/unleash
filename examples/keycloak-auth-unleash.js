'use strict';

// const unleash = require('unleash-server');
const unleash = require('../lib/server-impl.js');

const enableKeycloak = require('./keycloak-auth-hook');

unleash
    .start({
        databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
        secret: 'super-duper-secret',
        adminAuthentication: 'custom',
        preRouterHook: enableKeycloak,
    })
    .then(server => {
        console.log(
            `Unleash started on http://localhost:${server.app.get('port')}`
        );
    });
