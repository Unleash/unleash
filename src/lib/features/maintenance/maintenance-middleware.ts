import type { IUnleashConfig } from '../../types/index.js';
import type MaintenanceService from './maintenance-service.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';

export const MAINTENANCE_MODE_ENABLED =
    'Unleash is currently in maintenance mode.';

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
            res.status(503).send({
                message: MAINTENANCE_MODE_ENABLED,
            });
        } else {
            next();
        }
    };
};

export default maintenanceMiddleware;
