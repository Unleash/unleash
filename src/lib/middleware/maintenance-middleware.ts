import { IUnleashConfig } from '../types';
import MaintenanceService from '../services/maintenance-service';
import { IAuthRequest } from '../routes/unleash-types';

const maintenanceMiddleware = (
    { getLogger }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    maintenanceService: MaintenanceService,
): any => {
    const logger = getLogger('/middleware/maintenance-middleware.ts');
    logger.debug('Enabling Maintenance middleware');

    return async (req: IAuthRequest, res, next) => {
        const isProtectedPath = !req.path.includes('/maintenance');
        const writeMethod = ['POST', 'PUT', 'DELETE'].includes(req.method);
        if (
            isProtectedPath &&
            writeMethod &&
            (await maintenanceService.isMaintenanceMode())
        ) {
            res.status(503).send({});
        } else {
            next();
        }
    };
};

export default maintenanceMiddleware;
