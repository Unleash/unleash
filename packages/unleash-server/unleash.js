#!/usr/bin/env node

'use strict';

const program = require('commander');
const unleash = require('./server.js');


program
    .command('start', 'start unleash server')
    .command('migrate', 'migrate the unleash db')
    .option('-d, --databaseUri <databaseUri>', 'The full databaseUri to connect to, including username and password')
    .parse(process.argv);

unleash.start({ databaseUri: program.databaseUri });
