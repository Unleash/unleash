import { IUnleashConfig, IUnleashServices } from '../../types';

function findParam(
    name: string,
    { params, body }: any,
    defaultValue?: string,
): string | undefined {
    let found = params ? params[name] : undefined;
    if (found === undefined) {
        found = body ? body[name] : undefined;
    }
    return found || defaultValue;
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const projectPermissionMiddleware = (
    { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    { projectService, accessService }: IUnleashServices,
): any => {
    const logger = getLogger('/middleware/project-middleware.ts');
    logger.debug('Enabling Project permissions middleware');

    return async (req, res, next) => {
        req.checkProjectPermissions = async () => {
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

export default projectPermissionMiddleware;
