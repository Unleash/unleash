'use strict';

const gravatarUrl = require('gravatar-url');
const Joi = require('@hapi/joi');

module.exports = class User {
    constructor({ name, email, permissions, imageUrl } = {}) {
        Joi.assert(
            email,
            Joi.string()
                .email()
                .required(),
            'Email'
        );
        this.email = email;
        this.name = name;
        this.permissions = permissions;
        this.imageUrl =
            imageUrl || gravatarUrl(email, { size: '42', default: 'retro' });
    }
};
