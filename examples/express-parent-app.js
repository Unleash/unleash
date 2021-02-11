/* eslint-disable import/no-unresolved */

'use strict';

const express = require('express');
const unleash = require('../dist/lib/server-impl.js');

const app = express();
unleash
    .create({
        databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
        baseUriPath: '/unleash',
    })
    .then(unl => {
        app.use(unl.app); // automatically mounts to baseUriPath
        app.listen(process.env.PORT);
    });
