'use strict';

const util = require('util');

function ValidationError (message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(ValidationError, Error);

module.exports = ValidationError;
