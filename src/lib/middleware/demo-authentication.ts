import { Application } from 'express';
import AuthenticationRequired from '../types/authentication-required';
import { IUnleashServices } from '../types/services';
import { IUnleashConfig } from '../types/option';
import ApiUser from '../types/api-user';
import { ApiTokenType } from '../types/models/api-token';

function demoAuthentication(
    app: Application,
    basePath: string = '',
    { userService }: Pick<IUnleashServices, 'userService'>,
    { authentication }: Pick<IUnleashConfig, 'authentication'>,
): void {
    app.post(`${basePath}/api/admin/login`, async (req, res) => {
        const { email } = req.body;
        try {
            const user = await userService.loginUserWithoutPassword(
                email,
                true,
            );
            const session = req.session || {};
            // @ts-ignore
            session.user = user;
            // @ts-ignore
            req.session = session;
            res.status(200)
                // @ts-ignore
                .json(req.session.user)
                .end();
        } catch (e) {
            res.status(400)
                .json({ error: `Could not sign in with ${email}` })
                .end();
        }
    });

    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        // @ts-ignore
        if (req.session.user && req.session.user.email) {
            // @ts-ignore
            req.user = req.session.user;
        }
        next();
    });

    app.use(`${basePath}/api/client`, (req, res, next) => {
        // @ts-ignore
        if (!authentication.enableApiToken && !req.user) {
            // @ts-ignore
            req.user = new ApiUser({
                username: 'unauthed-default-client',
                permissions: [],
                environment: 'default',
                type: ApiTokenType.CLIENT,
                project: '*',
            });
        }
        next();
    });

    app.use(`${basePath}/api`, (req, res, next) => {
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
