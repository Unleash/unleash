'use strict';

const gravatarUrl = require('gravatar-url');
const Joi = require('@hapi/joi');

module.exports = class User {
    constructor({
        name,
        email,
        username,
        systemId,
        imageUrl,
        permissions,
    } = {}) {
        if (!username && !email) {
            throw new TypeError('Username or Email us reuqired');
        }
        Joi.assert(email, Joi.string().email(), 'Email');
        Joi.assert(username, Joi.string(), 'Username');
        Joi.assert(name, Joi.string(), 'Name');

        this.name = name;
        this.username = username;
        this.email = email;
        this.systemId = systemId;
        this.permissions = permissions;
        this.imageUrl = imageUrl || this.generateImageUrl();
    }

    generateImageUrl() {
        return gravatarUrl(this.email || this.username, {
            size: '42',
            default: 'retro',
        });
    }
};
