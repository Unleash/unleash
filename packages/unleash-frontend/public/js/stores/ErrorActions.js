'use strict';

const Reflux = require('reflux');

const ErrorActions = Reflux.createActions([
    'clear',
    'error',
]);

module.exports = ErrorActions;
