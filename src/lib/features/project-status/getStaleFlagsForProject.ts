import type { Db } from '../../server-impl';

export type GetStaleFlagsForProject = (projectId: string) => Promise<number>;

export const createGetStaleFlagsForProject =
    (db: Db): GetStaleFlagsForProject =>
    async (projectId) => {
        const result = await db('features')
            .count()
            .where({ project: projectId, archived: false })
            .where((builder) =>
                builder
                    .orWhere({ stale: true })
                    .orWhere({ potentially_stale: true }),
            );

        return Number(result[0].count);
    };

export const createFakeGetStaleFlagsForProject =
    (
        staleFlags: Awaited<ReturnType<GetStaleFlagsForProject>> = 0,
    ): GetStaleFlagsForProject =>
    () =>
        Promise.resolve(staleFlags);
