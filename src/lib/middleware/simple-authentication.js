const auth = require('basic-auth');
const User = require('../user');
const AuthenticationRequired = require('../authentication-required');

function insecureAuthentication(basePath = '', app) {
    app.post(`${basePath}/api/admin/login`, (req, res) => {
        const user = req.body;
        req.session.user = new User({ email: user.email });
        res.status(200)
            .json(req.session.user)
            .end();
    });

    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        if (req.session.user && req.session.user.email) {
            req.user = req.session.user;
        } else if (req.header('authorization')) {
            const user = auth(req);
            if (user && user.name) {
                req.user = new User({ username: user.name });
            }
        }
        next();
    });

    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        if (req.user) {
            return next();
        }
        return res
            .status('401')
            .json(
                new AuthenticationRequired({
                    path: `${basePath}/api/admin/login`,
                    type: 'unsecure',
                    message:
                        'You have to identify yourself in order to use Unleash.',
                }),
            )
            .end();
    });
}

module.exports = insecureAuthentication;
