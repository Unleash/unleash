import { ApiTokenType, type IApiToken } from '../../types/model.js';
import {
    ADMIN,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
} from '../../types/permissions.js';
import type { IUserPermission } from '../../types/stores/access-store.js';
import { ALL_PROJECTS } from '../../util/index.js';

export const canReadApiToken = (
    permissions: IUserPermission[],
    token: IApiToken,
): boolean => {
    if (
        permissions.some(
            ({ permission, project }) =>
                permission === ADMIN && (!project || project === ALL_PROJECTS),
        )
    ) {
        return true;
    }

    const requiredPermission =
        token.type === ApiTokenType.FRONTEND
            ? READ_FRONTEND_API_TOKEN
            : token.type === ApiTokenType.CLIENT ||
                token.type === ApiTokenType.BACKEND
              ? READ_CLIENT_API_TOKEN
              : undefined;

    if (!requiredPermission || token.projects.length === 0) {
        return false;
    }

    return token.projects.every((project) =>
        permissions.some(
            (permission) =>
                permission.permission === requiredPermission &&
                (!permission.project ||
                    permission.project === ALL_PROJECTS ||
                    permission.project === project),
        ),
    );
};
