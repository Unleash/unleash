'use strict';

// const unleash = require('unleash-server');
const unleash = require('../lib/server-impl.js');

const enableKeycloak = require('./keycloak-auth-hook');

unleash
    .start({
        databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
        adminAuthentication: 'custom',
        preRouterHook: enableKeycloak,
    })
    .then(server => {
        // eslint-disable-next-line no-console
        console.log(
            `Unleash started on http://localhost:${server.app.get('port')}`,
        );
    });
