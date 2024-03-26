import type { Request, Response, NextFunction } from 'express';
import type { IUnleashConfig } from '../types';

export const bearerTokenMiddleware = ({
    getLogger,
    flagResolver,
}: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>) => {
    const logger = getLogger('/middleware/bearer-token-middleware.ts');
    logger.debug('Enabling bearer token middleware');

    return (req: Request, _: Response, next: NextFunction) => {
        if (flagResolver.isEnabled('bearerTokenMiddleware')) {
            const authHeader = req.headers.authorization;

            if (authHeader) {
                req.headers.authorization = authHeader.replace(
                    /^Bearer\s+/i,
                    '',
                );
            }
        }
        next();
    };
};
