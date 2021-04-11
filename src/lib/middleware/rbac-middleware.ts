/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    CREATE_FEATURE,
    UPDATE_FEATURE,
    DELETE_FEATURE,
    ADMIN,
} from '../permissions';

const rbacMiddleware = (config: any, { accessService }: any): any => {
    const logger = config.getLogger('/middleware/rbac-middleware.js');
    logger.info('Enabling RBAC');

    const { featureToggleStore } = config.stores;

    return (req, res, next) => {
        req.checkRbac = async (permission: string) => {
            const { user, params } = req;

            if (!user) {
                logger.error('RBAC requires a user to exist on the request.');
                return false;
            }

            // Support ADMIN API tokens for enterpriseAuthentication.
            if (user.isAPI) {
                return user.permissions.includes(ADMIN);
            }

            if (!user.id) {
                logger.error('RBAC requires the user to have a unique id.');
                return false;
            }

            // For /api/admin/projects/:projectId we will find it as part of params
            let { projectId } = params;

            // Temporary workaround to figure our projectId for feature toggle updates.
            if ([UPDATE_FEATURE, DELETE_FEATURE].includes(permission)) {
                const { featureName } = params;
                projectId = await featureToggleStore.getProjectId(featureName);
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
