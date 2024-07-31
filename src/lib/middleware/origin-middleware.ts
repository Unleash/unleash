import type { Request, Response, NextFunction } from 'express';
import type { IUnleashConfig } from '../types';

export const originMiddleware = ({
    getLogger,
    flagResolver,
}: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>) => {
    const logger = getLogger('/middleware/origin-middleware.ts');
    logger.debug('Enabling origin middleware');

    return (req: Request, _: Response, next: NextFunction) => {
        if (!flagResolver.isEnabled('originMiddleware')) {
            return next();
        }

        const isUI = !req.headers.authorization;

        if (isUI) {
            logger.info('UI request', { method: req.method });
        } else {
            logger.info('API request', {
                method: req.method,
                userAgent: req.headers['user-agent'],
            });
        }

        next();
    };
};
