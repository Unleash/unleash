import { IAuthRequest } from '../routes/unleash-types';
import { NextFunction, Response } from 'express';
import AuthenticationRequired from '../types/authentication-required';
import { LogProvider } from '../logger';
import { UnleashError } from '../error/api-error';

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
            return res.status(401).json(
                new UnleashError({
                    name: 'PasswordMismatchError',
                    message: 'You must log in to use Unleash.',
                }),
            );
        }

        const path = `${baseUriPath}/auth/simple/login`;
        const error = new UnleashError({
            name: 'AuthenticationRequired',
            message: `You must log in to use Unleash. Your request had no authorization header, so we could not authorize you. Try logging in at ${baseUriPath}/auth/simple/login.`,
            type: 'password',
            path,
        });

        return res.status(error.statusCode).json(error);
    };
};

export default authorizationMiddleware;
