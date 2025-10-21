import type { Db } from '../../types/index.js';

const TABLE = 'edge_node_presence';
const GRACE_PERCENTAGE = 0.05;

export type GetEdgeInstances = () => Promise<{
    last30: number;
    last60: number;
    last90: number;
}>;

export const createGetEdgeInstances =
    (db: Db): GetEdgeInstances =>
    async () => {
        const result = await db
            .with('buckets', (qb) =>
                qb
                    .from(TABLE)
                    .whereRaw("bucket_ts >= NOW() - INTERVAL '90 days'")
                    .groupBy('bucket_ts')
                    .select(
                        db.raw('bucket_ts'),
                        db.raw('COUNT(*)::int AS active_nodes'),
                    ),
            )
            .from('buckets')
            .select({
                last30: db.raw(
                    `COALESCE(CEIL(AVG(active_nodes) FILTER (WHERE bucket_ts >= NOW() - INTERVAL '30 days') * ?)::int, 0)`,
                    [1 + GRACE_PERCENTAGE],
                ),
                last60: db.raw(
                    `COALESCE(CEIL(AVG(active_nodes) FILTER (WHERE bucket_ts >= NOW() - INTERVAL '60 days') * ?)::int, 0)`,
                    [1 + GRACE_PERCENTAGE],
                ),
                last90: db.raw(
                    `COALESCE(CEIL(AVG(active_nodes) FILTER (WHERE bucket_ts >= NOW() - INTERVAL '90 days') * ?)::int, 0)`,
                    [1 + GRACE_PERCENTAGE],
                ),
            })
            .first();

        return {
            last30: Number(result?.last30 ?? 0),
            last60: Number(result?.last60 ?? 0),
            last90: Number(result?.last90 ?? 0),
        };
    };

export const createFakeGetEdgeInstances =
    (
        edgeInstances: Awaited<ReturnType<GetEdgeInstances>> = {
            last30: 0,
            last60: 0,
            last90: 0,
        },
    ): GetEdgeInstances =>
    () =>
        Promise.resolve(edgeInstances);
