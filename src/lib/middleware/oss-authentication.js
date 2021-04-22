const AuthenticationRequired = require('../authentication-required');

function ossAuthHook(app, config) {
    const { baseUriPath } = config.server;

    const generateAuthResponse = async () =>
        new AuthenticationRequired({
            type: 'password',
            path: `${baseUriPath}/auth/simple/login`,
            message: 'You must sign in order to use Unleash',
        });

    app.use(`${baseUriPath}/api`, async (req, res, next) => {
        if (req.session && req.session.user) {
            req.user = req.session.user;
            return next();
        }
        if (req.user) {
            return next();
        }
        if (req.header('authorization')) {
            // API clients should get 401 without body
            return res.sendStatus(401);
        }
        // Admin UI users should get auth-response
        const authRequired = await generateAuthResponse();
        return res.status(401).json(authRequired);
    });
}

module.exports = ossAuthHook;
