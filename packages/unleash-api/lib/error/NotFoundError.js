'use strict';
const util = require('util');

function NotFoundError (message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(NotFoundError, Error);

module.exports = NotFoundError;
