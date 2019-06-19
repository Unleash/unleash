'use strict';

const User = require('../user');

function noneAuthentication(basePath = '', app) {
    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        req.user = new User({ email: 'none@unknown.com' });
        next();
    });
}

module.exports = noneAuthentication;
