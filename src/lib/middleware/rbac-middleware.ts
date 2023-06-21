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
        permissions: string[],
        projectId?: string,
        environment?: string,
    ): Promise<boolean>;
}

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

const rbacMiddleware = (
    config: Pick<IUnleashConfig, 'getLogger'>,
    { featureToggleStore }: Pick<IUnleashStores, 'featureToggleStore'>,
    accessService: PermissionChecker,
): any => {
    const logger = config.getLogger('/middleware/rbac-middleware.ts');
    logger.debug('Enabling RBAC middleware');

    return (req, res, next) => {
        req.checkRbac = async (permissions: string | string[]) => {
            const permissionsArray = Array.isArray(permissions)
                ? permissions
                : [permissions];

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

            let projectId =
                findParam('projectId', req) || findParam('project', req);
            let environment =
                findParam('environment', req) ||
                findParam('environmentId', req);

            // Temporary workaround to figure out projectId for feature toggle updates.
            // will be removed in Unleash v5.0
            if (
                !projectId &&
                permissionsArray.some((permission) =>
                    [DELETE_FEATURE, UPDATE_FEATURE].includes(permission),
                )
            ) {
                const { featureName } = params;
                projectId = await featureToggleStore.getProjectId(featureName);
            } else if (
                projectId === undefined &&
                permissionsArray.some(
                    (permission) =>
                        permission == CREATE_FEATURE ||
                        permission.endsWith('FEATURE_STRATEGY'),
                )
            ) {
                projectId = 'default';
            }

            return accessService.hasPermission(
                user,
                permissionsArray,
                projectId,
                environment,
            );
        };
        return next();
    };
};

export default rbacMiddleware;
