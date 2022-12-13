import { useContext } from 'react';
import AccessContext from '../contexts/AccessContext';
import { useChangeRequestsEnabled } from './useChangeRequestsEnabled';

export const useHasProjectAccess = (projectId: string) => {
    const { hasAccess } = useContext(AccessContext);
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const handleAccess = (
        permission: string | string[],
        projectId?: string,
        environmentId?: string
    ) => {
        if (Array.isArray(permission)) {
            return permission.some(permission => {
                if (projectId && environmentId) {
                    return hasAccess(permission, projectId, environmentId);
                } else if (projectId) {
                    return hasAccess(permission, projectId);
                } else {
                    return hasAccess(permission);
                }
            });
        } else {
            if (projectId && environmentId) {
                return hasAccess(permission, projectId, environmentId);
            } else if (projectId) {
                return hasAccess(permission, projectId);
            } else {
                return hasAccess(permission);
            }
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
