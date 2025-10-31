import type { Db } from '../../types/index.js';

const TABLE = 'edge_node_presence';

export type GetEdgeInstances = () => Promise<{
    lastMonth: number;
    monthBeforeLast: number;
    last12Months: number;
}>;

export const createGetEdgeInstances =
    (db: Db): GetEdgeInstances =>
    async () => {
        const result = await db
            .with('mw', (qb) =>
                qb.select(
                    db.raw(
                        "(date_trunc('month', NOW()) - INTERVAL '1 month')::timestamptz AS last_start",
                    ),
                    db.raw(
                        "date_trunc('month', NOW())::timestamptz AS last_end",
                    ),
                    db.raw(
                        "(date_trunc('month', NOW()) - INTERVAL '2 months')::timestamptz AS prev_start",
                    ),
                    db.raw(
                        "(date_trunc('month', NOW()) - INTERVAL '1 month')::timestamptz AS prev_end",
                    ),
                    db.raw(
                        "(date_trunc('month', NOW()) - INTERVAL '12 months')::timestamptz AS last12_start",
                    ),
                    db.raw(
                        "date_trunc('month', NOW())::timestamptz AS last12_end",
                    ),
                    db.raw(`
                        FLOOR(EXTRACT(EPOCH FROM (
                            date_trunc('month', NOW()) - (date_trunc('month', NOW()) - INTERVAL '1 month')
                        )) / 300)::int AS last_expected
                    `),
                    db.raw(`
                        FLOOR(EXTRACT(EPOCH FROM (
                            (date_trunc('month', NOW()) - INTERVAL '1 month') - (date_trunc('month', NOW()) - INTERVAL '2 months')
                        )) / 300)::int AS prev_expected
                    `),
                    db.raw(`
                        FLOOR(EXTRACT(EPOCH FROM (
                            date_trunc('month', NOW()) - (date_trunc('month', NOW()) - INTERVAL '12 months')
                        )) / 300)::int AS last12_expected
                    `),
                ),
            )
            .with('buckets', (qb) =>
                qb
                    .from(TABLE)
                    .joinRaw('CROSS JOIN mw')
                    .whereRaw(
                        'bucket_ts >= mw.last12_start AND bucket_ts < mw.last12_end',
                    )
                    .groupBy('bucket_ts')
                    .select(
                        db.raw('bucket_ts'),
                        db.raw(
                            'COUNT(DISTINCT node_ephem_id)::int AS active_nodes',
                        ),
                    ),
            )
            .with('agg', (qb) =>
                qb
                    .from('buckets')
                    .joinRaw('CROSS JOIN mw')
                    .select(
                        db.raw(`
                            COALESCE(
                                SUM(active_nodes) FILTER (
                                    WHERE bucket_ts >= mw.last_start AND bucket_ts < mw.last_end
                                ), 0
                            ) AS last_total
                        `),
                        db.raw(`
                            COALESCE(
                                SUM(active_nodes) FILTER (
                                    WHERE bucket_ts >= mw.prev_start AND bucket_ts < mw.prev_end
                                ), 0
                            ) AS prev_total
                        `),
                        db.raw(`
                            COALESCE(
                                SUM(active_nodes) FILTER (
                                    WHERE bucket_ts >= mw.last12_start AND bucket_ts < mw.last12_end
                                ), 0
                            ) AS last12_total
                        `),
                    ),
            )
            .from('agg')
            .joinRaw('CROSS JOIN mw')
            .select({
                lastMonth: db.raw(`
                    COALESCE(
                        ROUND((agg.last_total::numeric) / NULLIF(mw.last_expected, 0), 3),
                        0
                    )
                `),
                monthBeforeLast: db.raw(`
                    COALESCE(
                        ROUND((agg.prev_total::numeric) / NULLIF(mw.prev_expected, 0), 3),
                        0
                    )
                `),
                last12Months: db.raw(`
                    COALESCE(
                        ROUND((agg.last12_total::numeric) / NULLIF(mw.last12_expected, 0), 3),
                        0
                    )
                `),
            })
            .first();

        return {
            lastMonth: Number(result?.lastMonth ?? 0),
            monthBeforeLast: Number(result?.monthBeforeLast ?? 0),
            last12Months: Number(result?.last12Months ?? 0),
        };
    };

export const createFakeGetEdgeInstances =
    (
        edgeInstances: Awaited<ReturnType<GetEdgeInstances>> = {
            lastMonth: 0,
            monthBeforeLast: 0,
            last12Months: 0,
        },
    ): GetEdgeInstances =>
    () =>
        Promise.resolve(edgeInstances);
