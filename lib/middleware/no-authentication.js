'use strict';

const User = require('../user');

function noneAuthentication(basePath = '', app) {
    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        console.log('no auth!');
        if (req.session.user && req.session.user.email) {
            console.log(req.session.user);
            req.user = new User({ email: 'unknown@email.com' });
        }
        next();
    });
}

module.exports = noneAuthentication;
