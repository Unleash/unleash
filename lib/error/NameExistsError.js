var util = require('util');

function NameExistsError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
}

util.inherits(NameExistsError, Error);

module.exports = NameExistsError;
