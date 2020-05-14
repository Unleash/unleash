'use strict';

module.exports = class AuthenticationRequired {
    constructor({ type, path, message, options }) {
        this.type = type;
        this.path = path;
        this.message = message;
        this.options = options;
    }
};
