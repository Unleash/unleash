'use strict';

const cookieSession = require('cookie-session');

module.exports = function(config) {
    const sessionMiddleware = cookieSession({
        name: 'unleash-session',
        keys: [config.secret],
        maxAge: config.sessionAge,
        secureProxy: !!config.secureHeaders,
        path: config.baseUriPath === '' ? '/' : config.baseUriPath,
    });

    const extendTTL = (req, res, next) => {
        // Updates active sessions every hour
        req.session.nowInHours = Math.floor(Date.now() / 3600e3);
        next();
    };

    return (req, res, next) => {
        sessionMiddleware(req, res, () => extendTTL(req, res, next));
    };
};
