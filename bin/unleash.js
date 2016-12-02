#!/usr/bin/env node
'use strict';

process.env.NODE_ENV = 'production';

const program = require('commander');
const serverImpl = require('../lib/server-impl.js');

program
    .option('-p, --port <port>', 'The port you want to start unleash on')
    .option('-d, --databaseUri <databaseUri>', 'The full databaseUri to connect to, including username and password')
    .parse(process.argv);

const userOpts = {};

if(program.databaseUri) {
    userOpts.databaseUri = program.databaseUri;
}

if(program.port) {
    userOpts.port = program.port;
}

serverImpl.start(userOpts)
    .then(conf => console.log(`Unleash started on http://localhost:${conf.app.get('port')}`))
    .catch(console.err);

