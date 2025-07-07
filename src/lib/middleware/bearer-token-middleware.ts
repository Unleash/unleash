import type { Request, Response, NextFunction } from 'express';
import type { IUnleashConfig } from '../types/index.js';

export const bearerTokenMiddleware = ({
    getLogger,
}: Pick<IUnleashConfig, 'getLogger'>) => {
    const logger = getLogger('/middleware/bearer-token-middleware.ts');
    logger.debug('Enabling bearer token middleware');
    return (req: Request, _: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            req.headers.authorization = authHeader.replace(/^Bearer\s+/i, '');
        }
        next();
    };
};
