'use strict';

const User = require('../user');
const AuthenticationRequired = require('../authentication-required');

function unsecureAuthentication(app) {
    app.post('/api/admin/login', (req, res) => {
        const user = req.body;
        req.session.user = new User({ email: user.email });
        res
            .status(200)
            .json(req.session.user)
            .end();
    });

    app.use('/api/admin/', (req, res, next) => {
        if (req.session.user && req.session.user.email) {
            req.user = req.session.user;
        }
        next();
    });

    app.use('/api/admin/', (req, res, next) => {
        if (req.user) {
            next();
        } else {
            return res
                .status('401')
                .json(
                    new AuthenticationRequired({
                        path: '/api/admin/login',
                        type: 'unsecure',
                        message:
                            'You have to indentify yourself in order to use Unleash.',
                    })
                )
                .end();
        }
    });

    app.use((req, res, next) => {
        // Updates active sessions every hour
        req.session.nowInHours = Math.floor(Date.now() / 3600e3);
        next();
    });
}

module.exports = unsecureAuthentication;
