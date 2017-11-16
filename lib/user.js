'use strict';

const gravatar = require('gravatar');
const assert = require('assert');

module.exports = class User {
    constructor({ name, email, imageUrl } = {}) {
        assert(email, 'Email is required');
        this.email = email;
        this.name = name;
        this.imageUrl =
            imageUrl || gravatar.url(email, { s: '42', d: 'retro' });
    }
};
