import { Application } from 'express';
import authorizationMiddleware from './authorization-middleware';
import { LogProvider } from '../logger';
import AuthenticationRequired from '../types/authentication-required';

function ossAuthHook(
    app: Application,
    getLogger: LogProvider,
    baseUriPath: string,
): void {
    const generateAuthResponse = async () =>
        new AuthenticationRequired({
            type: 'password',
            path: `${baseUriPath}/auth/simple/login`,
            message: 'You must sign in order to use Unleash',
        });

    app.use(
        `${baseUriPath}/api`,
        authorizationMiddleware(getLogger, baseUriPath, generateAuthResponse),
    );
    app.use(
        `${baseUriPath}/logout`,
        authorizationMiddleware(getLogger, baseUriPath, generateAuthResponse),
    );
}
export default ossAuthHook;
