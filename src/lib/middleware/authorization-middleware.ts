import { IAuthRequest } from '../routes/unleash-types';
import { NextFunction, Response } from 'express';
import AuthenticationRequired from '../types/authentication-required';
import { LogProvider } from '../logger';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const authorizationMiddleware = (
    getLogger: LogProvider,
    baseUriPath: string,
): any => {
    const logger = getLogger('/middleware/authorization-middleware.ts');
    logger.debug('Enabling Authorization middleware');

    const generateAuthResponse = async () =>
        new AuthenticationRequired({
            type: 'password',
            path: `${baseUriPath}/auth/simple/login`,
            message: 'You must sign in order to use Unleash',
        });

    return async (req: IAuthRequest, res: Response, next: NextFunction) => {
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
    };
};

export default authorizationMiddleware;
