import type { IAuthRequest } from '../routes/unleash-types.js';
import type { NextFunction, Response } from 'express';
import type { LogProvider } from '../logger.js';
import UnauthorizedError from '../error/unauthorized-error.js';
import { AuthenticationRequired } from '../types/index.js';
const authorizationMiddleware = (
    getLogger: LogProvider,
    baseUriPath: string,
): any => {
    const logger = getLogger('/middleware/authorization-middleware.ts');
    logger.debug('Enabling Authorization middleware');

    return async (req: IAuthRequest, res: Response, next: NextFunction) => {
        if (!req.user?.isAPI && req.session?.user) {
            req.user = req.session.user;
            return next();
        }
        if (req.user) {
            return next();
        }
        if (req.header('authorization')) {
            // API clients should get 401 with a basic body
            const error = new UnauthorizedError(
                'You must log in to use Unleash.',
            );
            return res.status(error.statusCode).json(error);
        }

        const path = `${baseUriPath}/auth/simple/login`;
        const error = new AuthenticationRequired({
            message: `You must log in to use Unleash. Your request had no authorization header, so we could not authorize you. Try logging in at ${path}`,
            type: 'password',
            path,
        });

        return res.status(error.statusCode).json(error);
    };
};

export default authorizationMiddleware;
