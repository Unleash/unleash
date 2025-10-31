import type { Db } from '../../types/index.js';

const TABLE = 'edge_node_presence';

export type EdgeInstanceAveragesPerMonth = Record<string, number>;
export type GetEdgeInstances = () => Promise<EdgeInstanceAveragesPerMonth>;

export const createGetEdgeInstances =
    (db: Db): GetEdgeInstances =>
    async () => {
        const rows = await db
            .with('months', (qb) =>
                qb.fromRaw('generate_series(1, 12) AS gs').select(
                    db.raw(
                        "(date_trunc('month', NOW()) - (gs * INTERVAL '1 month'))::timestamptz AS mon_start",
                    ),
                    db.raw(
                        "(date_trunc('month', NOW()) - ((gs - 1) * INTERVAL '1 month'))::timestamptz AS mon_end",
                    ),
                    db.raw(
                        "to_char((date_trunc('month', NOW()) - (gs * INTERVAL '1 month')),'YYYY-MM') AS key",
                    ),
                    db.raw(`
                            FLOOR(EXTRACT(EPOCH FROM (
                                (date_trunc('month', NOW()) - ((gs - 1) * INTERVAL '1 month'))
                                - (date_trunc('month', NOW()) - (gs * INTERVAL '1 month'))
                            )) / 300)::int AS expected
                        `),
                ),
            )
            .with('rng', (qb) =>
                qb
                    .from('months')
                    .select(
                        db.raw('MIN(mon_start) AS min_start'),
                        db.raw('MAX(mon_end) AS max_end'),
                    ),
            )
            .with('buckets', (qb) =>
                qb
                    .from(TABLE)
                    .joinRaw('CROSS JOIN rng')
                    .whereRaw(
                        'bucket_ts >= rng.min_start AND bucket_ts < rng.max_end',
                    )
                    .groupBy('bucket_ts')
                    .select(
                        db.raw('bucket_ts'),
                        db.raw(
                            'COUNT(DISTINCT node_ephem_id)::int AS active_nodes',
                        ),
                    ),
            )
            .from('months as m')
            .joinRaw(
                'LEFT JOIN buckets b ON b.bucket_ts >= m.mon_start AND b.bucket_ts < m.mon_end',
            )
            .groupBy('m.key', 'm.expected')
            .orderBy('m.key', 'desc')
            .select(
                db.raw('m.key'),
                db.raw(
                    `
                    COALESCE(
                        ROUND((SUM(b.active_nodes)::numeric) / NULLIF(m.expected, 0), 3),
                        0
                    ) AS value
                `,
                ),
            );

        const series: EdgeInstanceAveragesPerMonth = {};
        for (const r of rows as Array<{ key: string; value: number }>) {
            series[r.key] = Number(r.value ?? 0);
        }
        return series;
    };

export const createFakeGetEdgeInstances =
    (
        edgeInstances: Awaited<ReturnType<GetEdgeInstances>> = {},
    ): GetEdgeInstances =>
    () =>
        Promise.resolve(edgeInstances);
