import {
    ADMIN,
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
    UPDATE_PROJECT_SEGMENT,
} from '../types/permissions';
import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
import type User from '../types/user';
import type { Request } from 'express';
import { extractUserId } from '../util';

interface PermissionChecker {
    hasPermission(
        user: User,
        permissions: string[],
        projectId?: string,
        environment?: string,
    ): Promise<boolean>;
}

export function findParam(
    name: string,
    { params, body }: Request,
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
    {
        featureToggleStore,
        segmentStore,
    }: Pick<IUnleashStores, 'featureToggleStore' | 'segmentStore'>,
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
                if (user.permissions.includes(ADMIN)) {
                    if (!req.user.id) {
                        req.user.id = extractUserId(req);
                    }
                    return true;
                } else {
                    return false;
                }
            }

            if (!user.id) {
                logger.error('RBAC requires the user to have a unique id.');
                return false;
            }

            let projectId =
                findParam('projectId', req) || findParam('project', req);
            const environment =
                findParam('environment', req) ||
                findParam('environmentId', req);

            // Temporary workaround to figure out projectId for feature flag updates.
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
                        permission === CREATE_FEATURE ||
                        permission.endsWith('FEATURE_STRATEGY'),
                )
            ) {
                projectId = 'default';
            }

            // DELETE segment does not include information about the segment's project
            // This is needed to check if the user has the right permissions on a project level
            if (
                !projectId &&
                permissionsArray.includes(UPDATE_PROJECT_SEGMENT) &&
                params.id
            ) {
                const { id } = params;
                const { project } = await segmentStore.get(id);
                projectId = project;
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
