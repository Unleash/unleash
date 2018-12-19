'use strict';

module.exports = class MissingPermission {
    constructor({ permission, message }) {
        this.permission = permission;
        this.message = message;
    }
};
