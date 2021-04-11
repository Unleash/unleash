'use strict';

const { ADMIN } = require('../permissions');
const User = require('../user');

function noneAuthentication(basePath = '', app) {
    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        req.user = new User({
            username: 'unknown',
            isAPI: true,
            permissions: [ADMIN],
        });
        next();
    });
}

module.exports = noneAuthentication;
