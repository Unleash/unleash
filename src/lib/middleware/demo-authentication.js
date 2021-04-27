const AuthenticationRequired = require('../authentication-required');

function demoAuthentication(app, basePath = '', { userService }) {
    app.post(`${basePath}/api/admin/login`, async (req, res) => {
        const { email } = req.body;
        const user = await userService.loginUserWithoutPassword(email, true);
        req.session.user = user;
        res.status(200)
            .json(req.session.user)
            .end();
    });

    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        if (req.session.user && req.session.user.email) {
            req.user = req.session.user;
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
                    type: 'demo',
                    message:
                        'You have to identify yourself in order to use Unleash.',
                }),
            )
            .end();
    });
}

module.exports = demoAuthentication;
