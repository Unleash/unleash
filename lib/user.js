'use strict';

const gravatarUrl = require('gravatar-url');
const Joi = require('@hapi/joi');

module.exports = class User {
    constructor({
        id,
        name,
        email,
        username,
        imageUrl,
        permissions,
        seenAt,
        loginAttempts,
        createdAt,
    } = {}) {
        if (!username && !email) {
            throw new TypeError('Username or Email us reuqired');
        }
        Joi.assert(email, Joi.string().email(), 'Email');
        Joi.assert(username, Joi.string(), 'Username');
        Joi.assert(name, Joi.string(), 'Name');

        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.permissions = permissions;
        this.imageUrl = imageUrl || this.generateImageUrl();
        this.seenAt = seenAt;
        this.loginAttempts = loginAttempts;
        this.createdAt = createdAt;
    }

    generateImageUrl() {
        return gravatarUrl(this.email || this.username, {
            size: '42',
            default: 'retro',
        });
    }
};
