'use strict';

const unleash = require('./lib/server-impl');
const { publicFolder } = require('unleash-frontend');

unleash.start({ publicFolder });
