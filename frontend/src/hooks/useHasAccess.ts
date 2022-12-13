import { useContext } from 'react';
import AccessContext from '../contexts/AccessContext';
import { useChangeRequestsEnabled } from './useChangeRequestsEnabled';

export const useHasProjectAccess = (projectId: string) => {
    const { hasAccess } = useContext(AccessContext);
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const handlePermissionAccess = (
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

    const handleAccess = (
        permission: string | string[],
        projectId?: string,
        environmentId?: string
    ) => {
        if (Array.isArray(permission)) {
            return permission.some(permission =>
                handlePermissionAccess(permission, projectId, environmentId)
            );
        } else {
            return handlePermissionAccess(permission, projectId, environmentId);
        }
    };

    return (permission: string | string[], environmentId: string) => {
        return (
            handleAccess(permission, projectId, environmentId) ||
            isChangeRequestConfigured(environmentId)
        );
    };
};

export const useHasAccess = (
    permission: string | string[],
    environmentId?: string,
    projectId?: string
) => {
    const checkAccess = useHasProjectAccess(projectId!);
    return checkAccess(permission, environmentId!);
};
