'use strict';

module.exports = class AuthenticationRequired {
    constructor({ type, path, message }) {
        this.type = type;
        this.path = path;
        this.message = message;
    }
};
