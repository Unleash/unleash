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

const getBounds = async (raw: ITestDb['rawDatabase']) => {
    const { rows } = await raw.raw(`
        SELECT
            (date_trunc('month', NOW()) - INTERVAL '2 months')::timestamptz AS prev_start,
            (date_trunc('month', NOW()) - INTERVAL '1 month')::timestamptz AS prev_end,
            (date_trunc('month', NOW()) - INTERVAL '1 month')::timestamptz AS last_start,
            date_trunc('month', NOW())::timestamptz AS last_end,
            date_trunc('month', NOW())::timestamptz AS this_start,
            (date_trunc('month', NOW()) + INTERVAL '1 month')::timestamptz AS this_end,
            (date_trunc('month', NOW()) - INTERVAL '12 months')::timestamptz AS last12_start,
            date_trunc('month', NOW())::timestamptz AS last12_end
    `);
    return rows[0] as {
        prev_start: string;
        prev_end: string;
        last_start: string;
        last_end: string;
        this_start: string;
        this_end: string;
        last12_start: string;
        last12_end: string;
    };
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
    db = await dbInit('edge_instances_e2e', getLogger);
    await db.rawDatabase.raw(`SET TIME ZONE 'UTC'`);
    getEdgeInstances = createGetEdgeInstances(db.rawDatabase);
});

afterEach(async () => {
    await db.rawDatabase(TABLE).delete();
});

afterAll(async () => {
    await db.destroy();
});

test('returns 0 when no data', async () => {
    await expect(getEdgeInstances()).resolves.toEqual({
        lastMonth: 0,
        monthBeforeLast: 0,
        last12Months: 0,
    });
});

test('counts only last full month with uniformly spread load', async () => {
    const { last_start, last_end } = await getBounds(db.rawDatabase);
    await insertSpreadAcrossMonth(db.rawDatabase, last_start, last_end, 2, 3);
    const expectedLast = await expectedForWindow(
        db.rawDatabase,
        last_start,
        last_end,
    );
    const res = await getEdgeInstances();
    expect(res).toMatchObject({ lastMonth: expectedLast, monthBeforeLast: 0 });
});

test('counts only month before last with uniformly spread load', async () => {
    const { prev_start, prev_end } = await getBounds(db.rawDatabase);
    await insertSpreadAcrossMonth(db.rawDatabase, prev_start, prev_end, 2, 5);
    const expectedPrev = await expectedForWindow(
        db.rawDatabase,
        prev_start,
        prev_end,
    );
    const res = await getEdgeInstances();
    expect(res).toMatchObject({ lastMonth: 0, monthBeforeLast: expectedPrev });
});

test('separates months correctly with different distributed loads', async () => {
    const { prev_start, prev_end, last_start, last_end } = await getBounds(
        db.rawDatabase,
    );
    await insertSpreadAcrossMonth(db.rawDatabase, prev_start, prev_end, 4, 9);
    await insertSpreadAcrossMonth(db.rawDatabase, last_start, last_end, 3, 4);
    const expectedPrev = await expectedForWindow(
        db.rawDatabase,
        prev_start,
        prev_end,
    );
    const expectedLast = await expectedForWindow(
        db.rawDatabase,
        last_start,
        last_end,
    );
    await expect(getEdgeInstances()).resolves.toMatchObject({
        lastMonth: expectedLast,
        monthBeforeLast: expectedPrev,
    });
});

test('ignores current month data even when current month is heavy', async () => {
    const { prev_start, prev_end, last_start, last_end, this_start, this_end } =
        await getBounds(db.rawDatabase);
    await insertSpreadAcrossMonth(db.rawDatabase, this_start, this_end, 1, 12);
    await insertSpreadAcrossMonth(db.rawDatabase, last_start, last_end, 5, 11);
    const expectedLast = await expectedForWindow(
        db.rawDatabase,
        last_start,
        last_end,
    );
    const expectedPrev = await expectedForWindow(
        db.rawDatabase,
        prev_start,
        prev_end,
    );
    await expect(getEdgeInstances()).resolves.toMatchObject({
        lastMonth: expectedLast,
        monthBeforeLast: expectedPrev,
    });
});

test('exact integral average is preserved after rounding', async () => {
    const { last_start, last_end } = await getBounds(db.rawDatabase);
    await insertSpreadAcrossMonth(db.rawDatabase, last_start, last_end, 3, 6);
    const expectedLast = await expectedForWindow(
        db.rawDatabase,
        last_start,
        last_end,
    );
    const res = await getEdgeInstances();
    expect(res.lastMonth).toBe(expectedLast);
    expect(res.monthBeforeLast).toBe(0);
});

test('computes weighted average for the last 12 months window', async () => {
    const {
        prev_start,
        prev_end,
        last_start,
        last_end,
        last12_start,
        last12_end,
    } = await getBounds(db.rawDatabase);
    await insertSpreadAcrossMonth(db.rawDatabase, prev_start, prev_end, 4, 7);
    await insertSpreadAcrossMonth(db.rawDatabase, last_start, last_end, 5, 9);
    const expectedPrev = await expectedForWindow(
        db.rawDatabase,
        prev_start,
        prev_end,
    );
    const expectedLast = await expectedForWindow(
        db.rawDatabase,
        last_start,
        last_end,
    );
    const expected12 = await expectedForWindow(
        db.rawDatabase,
        last12_start,
        last12_end,
    );
    const res = await getEdgeInstances();
    expect(res.lastMonth).toBe(expectedLast);
    expect(res.monthBeforeLast).toBe(expectedPrev);
    expect(res.last12Months).toBe(expected12);
});
