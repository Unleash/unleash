import type { Db } from '../../types/index.js';
import { FEATURE_FAVORITED } from '../../events/index.js';
import { RoleName } from '../../types/model.js';
import { ROOT_ROLE_TYPE } from '../../util/constants.js';

export type GetReadOnlyUsers = () => Promise<number>;

export const createGetReadOnlyUsers =
    (db: Db): GetReadOnlyUsers =>
    async () => {
        const result = await db('users')
            .countDistinct('users.id as readOnlyCount')
            .join('role_user', 'role_user.user_id', 'users.id')
            .join('roles', 'roles.id', 'role_user.role_id')
            .whereNull('users.deleted_at')
            .where('users.is_system', false)
            .where('users.is_service', false)
            .where('roles.name', RoleName.VIEWER)
            .where('roles.type', ROOT_ROLE_TYPE)
            .whereNotExists(function () {
                this.select('*')
                    .from('events')
                    .whereRaw('events.created_by_user_id = users.id')
                    .whereNot('events.type', FEATURE_FAVORITED);
            })
            .first();

        return Number(result?.readOnlyCount ?? 0);
    };

export const createFakeGetReadOnlyUsers =
    (
        readOnlyUsers: Awaited<ReturnType<GetReadOnlyUsers>> = 0,
    ): GetReadOnlyUsers =>
    () =>
        Promise.resolve(readOnlyUsers);
