'use strict';

const cookieSession = require('cookie-session');

module.exports = function(config) {
    return cookieSession({
        name: 'unleash-session',
        keys: [config.secret],
        maxAge: config.sessionAge,
        secureProxy: !!config.secureHeaders,
        path: config.baseUriPath === '' ? '/' : config.baseUriPath,
    });
};
