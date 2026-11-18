import { ApiTokenType, type IApiToken } from '../../types/model.js';
import {
    ADMIN,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
    READ_PROJECT_API_TOKEN,
} from '../../types/permissions.js';
import type { IUserPermission } from '../../types/stores/access-store.js';
import { ALL_PROJECTS } from '../../util/index.js';

const hasPermissionInAllProjects = (
    permissions: IUserPermission[],
    permission: string,
): boolean =>
    permissions.some(
        (grant) =>
            grant.permission === permission &&
            (!grant.project || grant.project === ALL_PROJECTS),
    );

const hasPermissionOnProject = (
    permissions: IUserPermission[],
    permission: string,
    project: string,
): boolean =>
    project !== ALL_PROJECTS &&
    permissions.some(
        (grant) => grant.permission === permission && grant.project === project,
    );

const tokenToReadPermission = (token: IApiToken): string | undefined => {
    return token.type === ApiTokenType.FRONTEND
        ? READ_FRONTEND_API_TOKEN
        : token.type === ApiTokenType.CLIENT ||
            token.type === ApiTokenType.BACKEND
          ? READ_CLIENT_API_TOKEN
          : undefined;
};

export const canReadApiToken = (
    permissions: IUserPermission[],
    token: IApiToken,
): boolean => {
    if (hasPermissionInAllProjects(permissions, ADMIN)) {
        return true;
    }

    const tokenReadPermission = tokenToReadPermission(token);

    if (!tokenReadPermission || token.projects.length === 0) {
        return false;
    }

    return token.projects.every(
        (project) =>
            hasPermissionInAllProjects(permissions, tokenReadPermission) ||
            hasPermissionOnProject(permissions, tokenReadPermission, project),
    );
};

export const canReadProjectApiToken = (
    permissions: IUserPermission[],
    token: IApiToken,
): boolean => {
    if (hasPermissionInAllProjects(permissions, ADMIN)) {
        return true;
    }

    const tokenReadPermission = tokenToReadPermission(token);

    if (!tokenReadPermission || token.projects.length === 0) {
        return false;
    }

    return token.projects.every(
        (project) =>
            hasPermissionInAllProjects(permissions, tokenReadPermission) ||
            hasPermissionOnProject(permissions, tokenReadPermission, project) ||
            hasPermissionOnProject(
                permissions,
                READ_PROJECT_API_TOKEN,
                project,
            ),
    );
};
