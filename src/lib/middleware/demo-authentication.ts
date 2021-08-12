import { Application } from 'express';
import AuthenticationRequired from '../types/authentication-required';
import { IUnleashServices } from '../types/services';

function demoAuthentication(
    app: Application,
    basePath: string = '',
    { userService }: Pick<IUnleashServices, 'userService'>,
): void {
    app.post(`${basePath}/api/admin/login`, async (req, res) => {
        const { email } = req.body;
        const user = await userService.loginUserWithoutPassword(email, true);
        const session = req.session || {};
        // @ts-ignore
        session.user = user;
        // @ts-ignore
        req.session = session;
        res.status(200)
            // @ts-ignore
            .json(req.session.user)
            .end();
    });

    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        // @ts-ignore
        if (req.session.user && req.session.user.email) {
            // @ts-ignore
            req.user = req.session.user;
        }
        next();
    });

    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        // @ts-ignore
        if (req.user) {
            return next();
        }
        return res
            .status(401)
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
export default demoAuthentication;
