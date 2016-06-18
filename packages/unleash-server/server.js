'use strict';
const unleash = require('unleash-api');
const { publicFolder } = require('unleash-frontend');

unleash.start({ publicFolder });
