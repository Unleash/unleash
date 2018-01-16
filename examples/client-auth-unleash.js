'use strict';

// const unleash = require('unleash-server');
const unleash = require('../lib/server-impl.js');

// You typically will not hard-code this value in your code!
const sharedSecret = '12312Random';

unleash
    .start({
        databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
<<<<<<< HEAD
        enableLegacyRoutes: false,
=======
>>>>>>> 0681945... Document how to secure client api #231
        preRouterHook: app => {
            app.use('/api/client', (req, res, next) => {
                if (req.headers.authorization === sharedSecret) {
                    next();
                } else {
                    res.sendStatus(401);
                }
            });
        },
    })
    .then(server => {
        console.log(
            `Unleash started on http://localhost:${server.app.get('port')}`
        );
    });
