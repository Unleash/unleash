import { IUnleashConfig, IUnleashServices } from '../../types';
import { findParam } from '../../middleware';
import { NextFunction, Response } from 'express';

const privateProjectMiddleware = (
    {
        getLogger,
        flagResolver,
    }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    { projectService, accessService }: IUnleashServices,
): any => {
    const logger = getLogger('/middleware/project-middleware.ts');
    logger.debug('Enabling private project middleware');

    if (!flagResolver.isEnabled('privateProjects')) {
        return (req, res, next) => next();
    }

    return async (req, res: Response, next: NextFunction) => {
        req.checkPrivateProjectPermissions = async () => {
            const { user } = req;

            let projectId =
                findParam('projectId', req) || findParam('project', req);

            if (projectId === undefined) {
                return true;
            }
            const permissions = await accessService.getPermissionsForUser(user);

            return (
                permissions.map((p) => p.permission).includes('ADMIN') ||
                projectService.isProjectUser(user.id, projectId)
            );
        };
        next();
    };
};

export default privateProjectMiddleware;
