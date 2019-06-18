#!/usr/bin/env node
'use strict';

process.env.NODE_ENV = 'production';

const serverImpl = require('../lib/server-impl.js');
const fs = require('fs');

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
            'The full databaseUrl to connect to, including username and password. Either databaseUrl or databaseUrlFile is required.',
        demand: false,
        type: 'string',
    })
    .option('databaseUrlFile', {
        alias: 'f',
        describe:
            'The full path to a file containing the full database url to connect to, including username and password. When this option is supplied, it takes precedence over databaseUrl.',
        demand: false,
        type: 'string',
    })
    .check(args => !!(args.databaseUrl || args.databaseUrlFile))
    .option('databaseSchema', {
        alias: 's',
        describe: 'The database schema to use',
        default: 'public',
        demand: false,
        type: 'string',
    }).argv;

if (argv.databaseUrlFile) {
    argv.databaseUrl = fs.readFileSync(argv.databaseUrlFile, 'utf8');
    delete argv.databaseUrlFile;
}

serverImpl
    .start(argv)
    .then(instance => {
        const address = instance.server.address();
        console.log(
            `Unleash started on http://${address.address}:${address.port}`
        );
    })
    .catch(console.err);
