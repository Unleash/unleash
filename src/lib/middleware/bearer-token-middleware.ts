import type { Request, Response, NextFunction } from 'express';
import type { IUnleashConfig } from '../types';

export const bearerTokenMiddleware = ({
    server,
    getLogger,
    flagResolver,
}: Pick<IUnleashConfig, 'server' | 'getLogger' | 'flagResolver'>) => {
    const logger = getLogger('/middleware/bearer-token-middleware.ts');
    logger.debug('Enabling bearer token middleware');
    const baseUriPath = server.baseUriPath || '';

    return (req: Request, _: Response, next: NextFunction) => {
        if (
            req.path.startsWith(`${baseUriPath}/api/signal-endpoint/`) ||
            flagResolver.isEnabled('bearerTokenMiddleware')
        ) {
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
