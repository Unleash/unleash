import type { Db } from '../../types/index.js';

export type GetReadOnlyUsers = () => Promise<number>;

export const createGetReadOnlyUsers =
    (db: Db): GetReadOnlyUsers =>
    async () => {
        const result = await db('users')
            .countDistinct('users.id as readOnlyCount')
            .where('users.seat_type', 'ReadOnly')
            .first();

        return Number(result?.readOnlyCount ?? 0);
    };

export const createFakeGetReadOnlyUsers =
    (
        readOnlyUsers: Awaited<ReturnType<GetReadOnlyUsers>> = 0,
    ): GetReadOnlyUsers =>
    () =>
        Promise.resolve(readOnlyUsers);
