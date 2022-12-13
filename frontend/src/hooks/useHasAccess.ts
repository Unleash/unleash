import { useContext } from 'react';
import AccessContext from '../contexts/AccessContext';
import { useChangeRequestsEnabled } from './useChangeRequestsEnabled';

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

export const useHasProjectEnvironmentAccess = (
    permission: string | string[],
    environmentId: string,
    projectId: string
) => {
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const checkAccess = useCheckProjectPermissions(projectId);
    const changeRequestMode = isChangeRequestConfigured(environmentId);

    return changeRequestMode || checkAccess(permission, environmentId);
};

export const useHasRootAccess = (
    permissions: string | string[],
    environmentId?: string,
    projectId?: string
) => {
    return useCheckProjectPermissions(projectId)(permissions, environmentId);
};
