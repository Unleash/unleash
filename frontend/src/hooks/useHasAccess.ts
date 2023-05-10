import { useContext } from 'react';
import AccessContext from '../contexts/AccessContext';
import { useChangeRequestsEnabled } from './useChangeRequestsEnabled';
import {
    CREATE_FEATURE_STRATEGY,
    DELETE_FEATURE_STRATEGY,
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
    UPDATE_FEATURE_STRATEGY,
} from '../component/providers/AccessProvider/permissions';
import { useAuthPermissions } from './api/getters/useAuth/useAuthPermissions';
import useProject from './api/getters/useProject/useProject';

/**
 * This is for features not integrated with change request.
 * If the feature is integrated with change request, use useCheckProjectAccess instead.
 */
export const useCheckProjectPermissions = (projectId?: string) => {
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

const useIsProjectMember = (projectId: string) => {
    const { permissions } = useAuthPermissions();
    const isProjectMember = permissions
        ? permissions.find(permission => permission.project === projectId)
        : false;
    return isProjectMember;
};

const useIsAllowedUser = (projectId: string) => {
    const isProjectMember = useIsProjectMember(projectId);
    const { project } = useProject(projectId);
    const isProtectedProject = project.mode === 'protected';
    return isProtectedProject ? isProjectMember : true;
};

const isChangeRequestPermission = (permission: string | string[]) => {
    const emptyArray: string[] = [];
    return intersect(
        ALLOWED_CHANGE_REQUEST_PERMISSIONS,
        emptyArray.concat(permission)
    );
};

const useIsAllowedForChangeRequest = (
    permission: string | string[],
    projectId: string,
    environmentId: string
) => {
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const isChangeRequestMode = isChangeRequestConfigured(environmentId);
    const isAllowedMember = useIsAllowedUser(projectId);

    return (
        isChangeRequestMode &&
        isAllowedMember &&
        isChangeRequestPermission(permission)
    );
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
    const checkAccess = useCheckProjectPermissions(projectId);
    const isAllowedForChangeRequest = useIsAllowedForChangeRequest(
        permission,
        projectId,
        environmentId
    );

    return isAllowedForChangeRequest || checkAccess(permission, environmentId);
};

export const useHasRootAccess = (
    permissions: string | string[],
    projectId?: string,
    environmentId?: string
) => {
    return useCheckProjectPermissions(projectId)(permissions, environmentId);
};
