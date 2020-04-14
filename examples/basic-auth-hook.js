/* eslint-disable import/no-unresolved */

'use strict';

const auth = require('basic-auth');
const { User } = require('../lib/server-impl.js');

function basicAuthentication(app) {
    app.use('/api/admin/', (req, res, next) => {
        const credentials = auth(req);

        if (credentials) {
            // you will need to do some verification of credentials here.
            const user = new User({ email: `${credentials.name}@domain.com` });
            req.user = user;
            return next();
        }

        return res
            .status('401')
            .set({ 'WWW-Authenticate': 'Basic realm="example"' })
            .end('access denied');
    });

    app.use((req, res, next) => {
        // Updates active sessions every hour
        req.session.nowInHours = Math.floor(Date.now() / 3600e3);
        next();
    });
}

module.exports = basicAuthentication;
