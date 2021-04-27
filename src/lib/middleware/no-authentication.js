'use strict';

const { ADMIN } = require('../permissions');
const ApiUser = require('../types/api-user');

function noneAuthentication(basePath = '', app) {
    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        if (!req.user) {
            req.user = new ApiUser({
                username: 'unknown',
                permissions: [ADMIN],
            });
        }
        next();
    });
}

module.exports = noneAuthentication;
