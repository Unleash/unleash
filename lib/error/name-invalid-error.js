'use strict';

class NameInvalidError extends Error {
    constructor(message) {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message;
        this.msg = message;
    }
}

module.exports = NameInvalidError;
