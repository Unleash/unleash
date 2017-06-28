#!/usr/bin/env node
'use strict';

process.env.NODE_ENV = 'production';

const serverImpl = require('../lib/server-impl.js');

const argv = require('yargs')
    .usage('$0 [options]')
    .env(true)
    .option('port', {
        alias: 'p',
        describe: 'The HTTP port you want to start unleash on',
        demand: false,
        default: 4242,
        type: 'number',
    })
    .option('databaseUrl', {
        alias: 'd',
        describe:
            'The full databaseUrl to connect to, including username and password',
        demand: true,
        type: 'string',
    }).argv;

serverImpl
    .start(argv)
    .then(conf =>
        console.log(
            `Unleash started on http://localhost:${conf.app.get('port')}`
        )
    )
    .catch(console.err);
