'use strict';

const cookieSession = require('cookie-session');

module.exports = config => {
    config.a = 1;
    return cookieSession(config.field);
};
