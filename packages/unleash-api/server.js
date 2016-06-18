'use strict';

const unleash = require('./server-impl');
const { publicFolder } = require('unleash-frontend');

unleash.start({ publicFolder });
