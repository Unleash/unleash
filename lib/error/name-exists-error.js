'use strict';

class NameExistsError extends Error {
    constructor (message) {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message;
    }
}

module.exports = NameExistsError;
