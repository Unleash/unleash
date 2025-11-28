import type { Db } from '../../types/index.js';
import { FEATURE_FAVORITED } from '../../events/index.js';

export type GetReadOnlyUsers = () => Promise<number>;

export const createGetReadOnlyUsers =
    (db: Db): GetReadOnlyUsers =>
    async () => {
        const result = await db('users')
            .countDistinct('users.id as readOnlyCount')
            .whereNull('users.deleted_at')
            .where('users.is_system', false)
            .where('users.is_service', false)
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
