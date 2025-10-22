import type { Db } from '../../types/index.js';

const TABLE = 'edge_node_presence';

export type GetEdgeInstances = () => Promise<{
    lastMonth: number;
    monthBeforeLast: number;
}>;

export const createGetEdgeInstances =
    (db: Db): GetEdgeInstances =>
    async () => {
        const result = await db
            .with('buckets', (qb) =>
                qb
                    .from(TABLE)
                    .whereRaw(
                        "bucket_ts >= date_trunc('month', NOW()) - INTERVAL '2 months'",
                    )
                    .groupBy('bucket_ts')
                    .select(
                        db.raw('bucket_ts'),
                        db.raw('COUNT(*)::int AS active_nodes'),
                    ),
            )
            .from('buckets')
            .select({
                lastMonth: db.raw(`
                    COALESCE(
                        CEIL(
                            AVG(active_nodes)
                            FILTER (
                                WHERE bucket_ts >= date_trunc('month', NOW()) - INTERVAL '1 month'
                                  AND bucket_ts < date_trunc('month', NOW())
                            )
                        )::int,
                        0
                    )
                `),
                monthBeforeLast: db.raw(`
                    COALESCE(
                        CEIL(
                            AVG(active_nodes)
                            FILTER (
                                WHERE bucket_ts >= date_trunc('month', NOW()) - INTERVAL '2 months'
                                  AND bucket_ts < date_trunc('month', NOW()) - INTERVAL '1 month'
                            )
                        )::int,
                        0
                    )
                `),
            })
            .first();

        return {
            lastMonth: Number(result?.lastMonth ?? 0),
            monthBeforeLast: Number(result?.monthBeforeLast ?? 0),
        };
    };

export const createFakeGetEdgeInstances =
    (
        edgeInstances: Awaited<ReturnType<GetEdgeInstances>> = {
            lastMonth: 0,
            monthBeforeLast: 0,
        },
    ): GetEdgeInstances =>
    () =>
        Promise.resolve(edgeInstances);
