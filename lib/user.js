'use strict';

const gravatar = require('gravatar');
const Joi = require('joi');

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
            imageUrl || gravatar.url(email, { s: '42', d: 'retro' });
    }
};
