'use strict';

const unleash = require('unleash-server');
const enableAuth0auth = require('./auth0-auth-hook');

unleash
    .start({
        adminAuthentication: 'custom',
        preRouterHook: enableAuth0auth,
    })
    .then(server => {
        // eslint-disable-next-line no-console
        console.log(
            `Unleash started on http://localhost:${server.app.get('port')}`,
        );
    });