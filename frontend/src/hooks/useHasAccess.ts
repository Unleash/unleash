import { useContext } from 'react';
import AccessContext from '../contexts/AccessContext';
import { useChangeRequestsEnabled } from './useChangeRequestsEnabled';
import {
    CREATE_FEATURE_STRATEGY,
    UPDATE_FEATURE_STRATEGY,
    DELETE_FEATURE_STRATEGY,
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
} from '../component/providers/AccessProvider/permissions';

/**
 * This is for features not integrated with change request.
 * If the feature is integrated with change request, use useCheckProjectAccess instead.
 */
const useCheckProjectPermissions = (projectId?: string) => {
    const { hasAccess } = useContext(AccessContext);

    const checkPermission = (
        permission: string,
        projectId?: string,
        environmentId?: string
    ) => {
        if (projectId && environmentId) {
            return hasAccess(permission, projectId, environmentId);
        } else if (projectId) {
            return hasAccess(permission, projectId);
        } else {
            return hasAccess(permission);
        }
    };

    const checkPermissions = (
        permissions: string | string[],
        projectId?: string,
        environmentId?: string
    ) => {
        if (Array.isArray(permissions)) {
            return permissions.some(permission =>
                checkPermission(permission, projectId, environmentId)
            );
        } else {
            return checkPermission(permissions, projectId, environmentId);
        }
    };

    return (permissions: string | string[], environmentId?: string) => {
        return checkPermissions(permissions, projectId, environmentId);
    };
};

/**
 * This is for features integrated with change request.
 * If the feature is not integrated with change request, use useCheckProjectPermissions instead.
 * When change request is enabled, the user will have access to the feature because permissions will be checked later
 */
export const useCheckProjectAccess = (projectId: string) => {
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const checkAccess = useCheckProjectPermissions(projectId);

    return (permission: string, environment: string) => {
        return (
            isChangeRequestConfigured(environment) ||
            checkAccess(permission, environment)
        );
    };
};

const ALLOWED_CHANGE_REQUEST_PERMISSIONS = [
    CREATE_FEATURE_STRATEGY,
    UPDATE_FEATURE_STRATEGY,
    DELETE_FEATURE_STRATEGY,
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
];

const intersect = (array1: string[], array2: string[]) => {
    return array1.filter(value => array2.includes(value)).length > 0;
};

/**
 * This methods does the same as useCheckProjectAccess but also checks if the permission is in ALLOWED_CHANGE_REQUEST_PERMISSIONS
 * If you know what you're doing you can skip that check and call useCheckProjectAccess
 */
export const useHasProjectEnvironmentAccess = (
    permission: string | string[],
    projectId: string,
    environmentId: string
) => {
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const checkAccess = useCheckProjectPermissions(projectId);
    const changeRequestMode = isChangeRequestConfigured(environmentId);
    const emptyArray: string[] = [];

    return (
        (changeRequestMode &&
            intersect(
                ALLOWED_CHANGE_REQUEST_PERMISSIONS,
                emptyArray.concat(permission)
            )) ||
        checkAccess(permission, environmentId)
    );
};

export const useHasRootAccess = (
    permissions: string | string[],
    projectId?: string,
    environmentId?: string
) => {
    return useCheckProjectPermissions(projectId)(permissions, environmentId);
};
