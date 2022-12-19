import { IUnleashConfig } from '../types';
import { Request } from 'express';

const maintenanceMiddleware = ({
    getLogger,
    flagResolver,
}: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>): any => {
    const logger = getLogger('/middleware/maintenance-middleware.ts');
    logger.debug('Enabling Maintenance middleware');

    return async (req: Request, res, next) => {
        const writeMethod = ['POST', 'PUT', 'DELETE'].includes(req.method);
        if (writeMethod && flagResolver.isEnabled('maintenance')) {
            res.status(503).send({});
        } else {
            next();
        }
    };
};

export default maintenanceMiddleware;
