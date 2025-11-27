import {
    createGetEdgeInstances,
    type GetEdgeInstances,
} from './getEdgeInstances.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';

let db: ITestDb;
let getEdgeInstances: GetEdgeInstances;

const TABLE = 'edge_node_presence';

const getMonthRange = async (raw: ITestDb['rawDatabase'], offset: number) => {
    const { rows } = await raw.raw(
        `
        SELECT
            (date_trunc('month', NOW()) - (? * INTERVAL '1 month'))::timestamptz AS start_ts,
            (
                CASE
                    WHEN ? = 0 THEN NOW()
                    ELSE (date_trunc('month', NOW()) - ((? - 1) * INTERVAL '1 month'))
                END
            )::timestamptz AS end_ts,
            to_char((date_trunc('month', NOW()) - (? * INTERVAL '1 month')), 'YYYY-MM') AS key
        `,
        [offset, offset, offset, offset],
    );
    return rows[0] as { start_ts: string; end_ts: string; key: string };
};

const expectedForWindow = async (
    raw: ITestDb['rawDatabase'],
    startIso: string,
    endIso: string,
) => {
    const { rows } = await raw.raw(
        `
        WITH mw AS (
            SELECT ?::timestamptz AS start_ts, ?::timestamptz AS end_ts
        ),
        buckets AS (
            SELECT bucket_ts, COUNT(DISTINCT node_ephem_id)::int AS active_nodes
            FROM ${TABLE}
            CROSS JOIN mw
            WHERE bucket_ts >= mw.start_ts AND bucket_ts < mw.end_ts
            GROUP BY bucket_ts
        ),
        totals AS (
            SELECT COALESCE(SUM(active_nodes), 0) AS total FROM buckets
        )
        SELECT COALESCE(
            ROUND(
                (totals.total::numeric)
                / NULLIF(FLOOR(EXTRACT(EPOCH FROM (mw.end_ts - mw.start_ts)) / 300)::int, 0),
            3),
            0
        ) AS val
        FROM totals CROSS JOIN mw
        `,
        [startIso, endIso],
    );
    return Number(rows[0].val);
};

const countRowsInWindow = async (
    raw: ITestDb['rawDatabase'],
    startIso: string,
    endIso: string,
) => {
    const { rows } = await raw.raw(
        `
        SELECT COUNT(*)::int AS c
        FROM ${TABLE}
        WHERE bucket_ts >= ?::timestamptz AND bucket_ts < ?::timestamptz
        `,
        [startIso, endIso],
    );
    return Number(rows[0].c);
};

const insertSpreadAcrossMonth = async (
    raw: ITestDb['rawDatabase'],
    startIso: string,
    endIso: string,
    everyNth: number,
    nodesPerBucket: number,
) => {
    await raw.raw(
        `
        WITH series AS (
            SELECT generate_series(
                ?::timestamptz,
                (?::timestamptz - INTERVAL '5 minutes'),
                INTERVAL '5 minutes'
            ) AS ts
        ),
        picked AS (
            SELECT ts
            FROM series
            WHERE (EXTRACT(EPOCH FROM ts) / 300)::bigint % ? = 0
        )
        INSERT INTO ${TABLE} (bucket_ts, node_ephem_id)
        SELECT
            p.ts,
            'node-' || to_char(p.ts AT TIME ZONE 'UTC', 'YYYYMMDDHH24MI') || '-' || i::text
        FROM picked p
        CROSS JOIN generate_series(1, ?) AS i
        ON CONFLICT (bucket_ts, node_ephem_id) DO NOTHING
        `,
        [startIso, endIso, everyNth, nodesPerBucket],
    );
};

beforeAll(async () => {
    db = await dbInit('edge_instances_series_e2e', getLogger);
    await db.rawDatabase.raw(`SET TIME ZONE 'UTC'`);
    getEdgeInstances = createGetEdgeInstances(db.rawDatabase);
});

afterEach(async () => {
    await db.rawDatabase(TABLE).delete();
});

afterAll(async () => {
    await db.destroy();
});

test('returns 12 months including current month with zeros when no data and keys match exact last-12 range', async () => {
    const res = await getEdgeInstances();
    const keys = Object.keys(res);
    expect(keys.length).toBe(12);
    for (let i = 0; i < 12; i++) {
        const { key } = await getMonthRange(db.rawDatabase, i);
        expect(keys).toContain(key);
        expect(res[key]).toBe(0);
    }
});

test('computes average for last month and guarantees data actually inserted', async () => {
    const { start_ts, end_ts, key } = await getMonthRange(db.rawDatabase, 1);
    await insertSpreadAcrossMonth(db.rawDatabase, start_ts, end_ts, 2, 3);
    const inserted = await countRowsInWindow(db.rawDatabase, start_ts, end_ts);
    expect(inserted).toBeGreaterThan(0);
    const expected = await expectedForWindow(db.rawDatabase, start_ts, end_ts);
    expect(expected).toBeGreaterThan(0);
    const res = await getEdgeInstances();
    expect(res[key]).toBe(expected);
});

test('separates last two months with different loads and at least one non-zero in series', async () => {
    const m1 = await getMonthRange(db.rawDatabase, 1);
    const m2 = await getMonthRange(db.rawDatabase, 2);
    await insertSpreadAcrossMonth(db.rawDatabase, m2.start_ts, m2.end_ts, 4, 9);
    await insertSpreadAcrossMonth(db.rawDatabase, m1.start_ts, m1.end_ts, 3, 4);
    const insertedM1 = await countRowsInWindow(
        db.rawDatabase,
        m1.start_ts,
        m1.end_ts,
    );
    const insertedM2 = await countRowsInWindow(
        db.rawDatabase,
        m2.start_ts,
        m2.end_ts,
    );
    expect(insertedM1).toBeGreaterThan(0);
    expect(insertedM2).toBeGreaterThan(0);
    const expectedM1 = await expectedForWindow(
        db.rawDatabase,
        m1.start_ts,
        m1.end_ts,
    );
    const expectedM2 = await expectedForWindow(
        db.rawDatabase,
        m2.start_ts,
        m2.end_ts,
    );
    const res = await getEdgeInstances();
    expect(res[m1.key]).toBe(expectedM1);
    expect(res[m2.key]).toBe(expectedM2);
    const nonZero = Object.values(res).filter((v) => v > 0).length;
    expect(nonZero).toBeGreaterThan(0);
});

test('includes current month data up to now alongside previous months', async () => {
    await db.rawDatabase.transaction(async (trx) => {
        const current = await getMonthRange(trx, 0);
        const m1 = await getMonthRange(trx, 1);
        const m2 = await getMonthRange(trx, 2);

        await insertSpreadAcrossMonth(
            trx,
            current.start_ts,
            current.end_ts,
            2,
            8,
        );
        await insertSpreadAcrossMonth(trx, m1.start_ts, m1.end_ts, 5, 11);

        const currentInserted = await countRowsInWindow(
            trx,
            current.start_ts,
            current.end_ts,
        );
        expect(currentInserted).toBeGreaterThan(0);

        const expectedCurrent = await expectedForWindow(
            trx,
            current.start_ts,
            current.end_ts,
        );
        const expectedM1 = await expectedForWindow(trx, m1.start_ts, m1.end_ts);
        const expectedM2 = await expectedForWindow(trx, m2.start_ts, m2.end_ts);

        const getEdgeInstancesWithTrx = createGetEdgeInstances(trx);
        const res = await getEdgeInstancesWithTrx();
        expect(res[current.key]).toBe(expectedCurrent);
        expect(expectedM1).toBeGreaterThan(0);
        expect(res[m1.key]).toBe(expectedM1);
        expect(res[m2.key]).toBe(expectedM2);
    });
});
