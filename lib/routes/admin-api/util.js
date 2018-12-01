'use strict';

const isUrlFriendlyName = input => encodeURIComponent(input) === input;

module.exports = { isUrlFriendlyName };
