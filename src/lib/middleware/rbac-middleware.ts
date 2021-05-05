/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    CREATE_FEATURE,
    UPDATE_FEATURE,
    DELETE_FEATURE,
    ADMIN,
} from '../types/permissions';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import User from '../types/user';

interface PermissionChecker {
    hasPermission(
        user: User,
        permission: string,
        projectId?: string,
    ): Promise<boolean>;
}

const rbacMiddleware = (
    config: Pick<IUnleashConfig, 'getLogger'>,
    { featureToggleStore }: Pick<IUnleashStores, 'featureToggleStore'>,
    accessService: PermissionChecker,
): any => {
    const logger = config.getLogger('/middleware/rbac-middleware.js');
    logger.info('Enabling RBAC');

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
            let { projectId } = params;

            // Temporary workaround to figure out projectId for feature toggle updates.
            if (permission === DELETE_FEATURE) {
                const { featureName } = params;
                projectId = await featureToggleStore.getProjectId(featureName);
            } else if (permission === UPDATE_FEATURE) {
                // if projectId of feature is different from project in body
                // need to check that we have UPDATE_FEATURE access on both old and new project
                // TODO: Look at this to make it smoother once we get around to looking at project
                // Changing project of a toggle should most likely be a separate endpoint
                const { featureName } = params;
                projectId = await featureToggleStore.getProjectId(featureName);
                const newProjectId = req.body
                    ? req.body.project || projectId
                    : projectId;
                if (newProjectId !== projectId) {
                    return (
                        accessService.hasPermission(
                            user,
                            permission,
                            projectId,
                        ) &&
                        accessService.hasPermission(
                            user,
                            permission,
                            newProjectId,
                        )
                    );
                }
            } else if (permission === CREATE_FEATURE) {
                projectId = req.body.project || 'default';
            }

            return accessService.hasPermission(user, permission, projectId);
        };
        return next();
    };
};

module.exports = rbacMiddleware;
export default rbacMiddleware;
