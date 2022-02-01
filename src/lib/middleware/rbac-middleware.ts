/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    ADMIN,
    UPDATE_FEATURE,
} from '../types/permissions';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import User from '../types/user';

interface PermissionChecker {
    hasPermission(
        user: User,
        permission: string,
        projectId?: string,
        environment?: string,
    ): Promise<boolean>;
}

const rbacMiddleware = (
    config: Pick<IUnleashConfig, 'getLogger'>,
    { featureToggleStore }: Pick<IUnleashStores, 'featureToggleStore'>,
    accessService: PermissionChecker,
): any => {
    const logger = config.getLogger('/middleware/rbac-middleware.ts');
    logger.debug('Enabling RBAC middleware');

    return (req, res, next) => {
        req.checkRbac = async (permission: string) => {
            const { user, params } = req;

            if (!user) {
                logger.error('RBAC requires a user to exist on the request.');
                return false;
            }

            if (user.isAPI) {
                return user.permissions.includes(ADMIN);
            }

            if (!user.id) {
                logger.error('RBAC requires the user to have a unique id.');
                return false;
            }

            // For /api/admin/projects/:projectId we will find it as part of params
            let { projectId, environment } = params;

            // Temporary workaround to figure out projectId for feature toggle updates.
            // will be removed in Unleash v5.0
            if ([DELETE_FEATURE, UPDATE_FEATURE].includes(permission)) {
                const { featureName } = params;
                projectId = await featureToggleStore.getProjectId(featureName);
            } else if (permission === CREATE_FEATURE) {
                projectId = projectId || req.body.project || 'default';
            }

            return accessService.hasPermission(
                user,
                permission,
                projectId,
                environment,
            );
        };
        return next();
    };
};

export default rbacMiddleware;
