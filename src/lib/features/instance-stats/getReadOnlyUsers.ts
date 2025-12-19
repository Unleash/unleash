import type { Db } from '../../types/index.js';
import {
    FEATURE_FAVORITED,
    FEATURE_UNFAVORITED,
    PROJECT_FAVORITED,
    PROJECT_UNFAVORITED,
} from '../../events/index.js';
import { RoleName } from '../../types/model.js';
import { ROOT_ROLE_TYPE } from '../../util/constants.js';
import type { AccessService } from '../../server-impl.js';

const READONLY_EVENTS = [
    FEATURE_FAVORITED,
    FEATURE_UNFAVORITED,
    PROJECT_FAVORITED,
    PROJECT_UNFAVORITED,
];

export type GetReadOnlyUsers = () => Promise<number>;

export const createGetReadOnlyUsers =
    (accessService: AccessService, db: Db): GetReadOnlyUsers =>
    async () => {
        const userIds = await db('users')
            .select('users.id as userId')
            .join('role_user', 'role_user.user_id', 'users.id')
            .join('roles', 'roles.id', 'role_user.role_id')
            // Ensure valid user
            .whereNull('users.deleted_at')
            .where('users.is_system', false)
            .where('users.is_service', false)
            // Ensure Viewer root role
            .where('roles.name', RoleName.VIEWER)
            .where('roles.type', ROOT_ROLE_TYPE)
            // Ensure no write events
            .whereNotExists(function () {
                this.select(1)
                    .from('events')
                    .whereRaw('events.created_by_user_id = users.id')
                    .whereNotIn('events.type', READONLY_EVENTS);
            });
        // Ensure no permissions across all roles and groups
        // Ensure no permissions across root and project roles
        // Ensure no permissions from group project roles
        const result = userIds.filter(async ({ userId }) => {
            const allPermissions =
                await accessService.getPermissionsForUser(userId);
            return (
                allPermissions.filter((p) => Boolean(p.project)).length === 0
            );
        });

        return result.length;
    };

export const createFakeGetReadOnlyUsers =
    (
        readOnlyUsers: Awaited<ReturnType<GetReadOnlyUsers>> = 0,
    ): GetReadOnlyUsers =>
    () =>
        Promise.resolve(readOnlyUsers);
