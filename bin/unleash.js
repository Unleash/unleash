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
    .option('host', {
        alias: 'l',
        describe: 'The HTTP address the server will accept connections on.',
        demand: false,
        type: 'string',
    })
    .option('databaseUrl', {
        alias: 'd',
        describe:
            'The full databaseUrl to connect to, including username and password',
        demand: true,
        type: 'string',
    })
    .option('databaseSchema', {
        alias: 's',
        describe: 'The database schema to use',
        default: 'public',
        demand: false,
        type: 'string',
    }).argv;

serverImpl
    .start(argv)
    .then(instance => {
        const address = instance.server.address();
        console.log(
            `Unleash started on http://${address.address}:${address.port}`
        );
    })
    .catch(console.err);
