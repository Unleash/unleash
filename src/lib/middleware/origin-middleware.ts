import type { Request, Response, NextFunction } from 'express';
import type { IUnleashConfig } from '../types';
import { REQUEST_ORIGIN, emitMetricEvent } from '../metric-events';
import {
    determineIntegrationSource,
    getFilteredOrigin,
} from './integration-headers';

export const originMiddleware = ({
    getLogger,
    eventBus,
    flagResolver,
}: Pick<IUnleashConfig, 'getLogger' | 'eventBus' | 'flagResolver'>) => {
    const logger = getLogger('/middleware/origin-middleware.ts');
    logger.debug('Enabling origin middleware');

    return (req: Request, _: Response, next: NextFunction) => {
        if (!flagResolver.isEnabled('originMiddleware')) {
            return next();
        }

        const isUI = !req.headers.authorization;

        if (isUI) {
            emitMetricEvent(eventBus, REQUEST_ORIGIN, {
                type: 'UI',
                method: req.method,
            });
        } else {
            const userAgent = req.headers['user-agent'];
            const uaLabel = userAgent
                ? determineIntegrationSource(userAgent)
                : 'Other';
            logger.info('API request', {
                method: req.method,
                userAgent: req.headers['user-agent'],
                origin: getFilteredOrigin(req),
            });
            emitMetricEvent(eventBus, REQUEST_ORIGIN, {
                type: 'API',
                method: req.method,
                source: uaLabel,
            });
        }

        next();
    };
};
