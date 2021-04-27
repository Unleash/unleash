'use strict';

// const unleash = require('unleash-server');
const unleash = require('../dist/lib/server-impl.js');

// You typically will not hard-code this value in your code!
const sharedSecret = '12312Random';

unleash
    .start({
        databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
        preRouterHook: app => {
            app.use('/api/client', (req, res, next) => {
                if (req.header('authorization') === sharedSecret) {
                    next();
                } else {
                    res.sendStatus(401);
                }
            });
        },
    })
    .then(server => {
        // eslint-disable-next-line no-console
        console.log(
            `Unleash started on http://localhost:${server.app.get('port')}`,
        );
    });
