import type { Application } from 'express';
import AuthenticationRequired from '../types/authentication-required';
import type { IUnleashServices } from '../types/services';
import type { IUnleashConfig } from '../types/option';
import ApiUser from '../types/api-user';
import { ApiTokenType } from '../types/models/api-token';
import type { IAuthRequest, IUser } from '../server-impl';
import type { IApiRequest } from '../routes/unleash-types';
import { encrypt } from '../util';

function demoAuthentication(
    app: Application,
    basePath: string,
    { userService }: Pick<IUnleashServices, 'userService'>,
    {
        authentication,
        flagResolver,
    }: Pick<IUnleashConfig, 'authentication' | 'flagResolver'>,
): void {
    app.post(`${basePath}/auth/demo/login`, async (req: IAuthRequest, res) => {
        let { email } = req.body;
        let user: IUser;

        try {
            if (authentication.demoAllowAdminLogin && email === 'admin') {
                user = await userService.loginDemoAuthDefaultAdmin();
            } else {
                email = flagResolver.isEnabled('encryptEmails', { email })
                    ? encrypt(email)
                    : email;

                user = await userService.loginUserWithoutPassword(email, true);
            }

            req.session.user = user;
            return res.status(200).json(user);
        } catch (e) {
            res.status(400)
                .json({ error: `Could not sign in with ${email}` })
                .end();
        }
    });

    app.use(`${basePath}/api/admin/`, (req: IAuthRequest, res, next) => {
        if (req.session.user?.email || req.session.user?.username === 'admin') {
            req.user = req.session.user;
        }
        next();
    });

    app.use(`${basePath}/api/client`, (req: IApiRequest, res, next) => {
        if (!authentication.enableApiToken && !req.user) {
            req.user = new ApiUser({
                tokenName: 'unauthed-default-client',
                permissions: [],
                environment: 'default',
                type: ApiTokenType.CLIENT,
                project: '*',
                secret: 'a',
            });
        }
        next();
    });

    app.use(`${basePath}/api`, (req: IAuthRequest, res, next) => {
        if (req.user) {
            return next();
        }
        return res
            .status(401)
            .json(
                new AuthenticationRequired({
                    path: `${basePath}/auth/demo/login`,
                    type: 'demo',
                    message:
                        'You have to identify yourself in order to use Unleash.',
                }),
            )
            .end();
    });
}

export default demoAuthentication;
