import type { Db } from '../../types/index.js';

export type GetLicensedUsers = () => Promise<number>;

export const createGetLicensedUsers =
    (db: Db): GetLicensedUsers =>
    async () => {
        const result = await db('users')
            .countDistinct('email_hash as activeCount')
            .whereNotNull('email_hash')
            .andWhere(function () {
                this.whereNull('deleted_at').orWhere(
                    'deleted_at',
                    '>=',
                    db.raw("NOW() - INTERVAL '30 days'"),
                );
            })
            .first();

        return Number(result?.activeCount ?? 0);
    };

export const createFakeGetLicensedUsers =
    (
        licencedUsers: Awaited<ReturnType<GetLicensedUsers>> = 0,
    ): GetLicensedUsers =>
    () =>
        Promise.resolve(licencedUsers);
