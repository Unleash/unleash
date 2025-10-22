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

const firstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) =>
    new Date(d.getFullYear(), d.getMonth() + n, 1);

const monthWindows = () => {
    const now = new Date();
    const thisMonthStart = firstDayOfMonth(now);
    const lastMonthStart = addMonths(thisMonthStart, -1);
    const monthBeforeLastStart = addMonths(thisMonthStart, -2);
    const lastMonthEnd = thisMonthStart;
    const monthBeforeLastEnd = lastMonthStart;
    return {
        monthBeforeLastStart,
        monthBeforeLastEnd,
        lastMonthStart,
        lastMonthEnd,
        thisMonthStart,
    };
};

const atMidMonth = (start: Date) =>
    new Date(start.getFullYear(), start.getMonth(), 15);
const atLateMonth = (start: Date) =>
    new Date(start.getFullYear(), start.getMonth(), 25);

const rowsForBucket = (count: number, when: Date) =>
    Array.from({ length: count }, (_, i) => ({
        bucket_ts: when,
        node_ephem_id: `node-${when.getTime()}-${i}`,
    }));

beforeAll(async () => {
    db = await dbInit('edge_instances_e2e', getLogger);
    getEdgeInstances = createGetEdgeInstances(db.rawDatabase);
});

afterEach(async () => {
    await db.rawDatabase(TABLE).delete();
});

afterAll(async () => {
    await db.destroy();
});

test('returns 0 for both months when no data', async () => {
    await expect(getEdgeInstances()).resolves.toEqual({
        lastMonth: 0,
        monthBeforeLast: 0,
    });
});

test('counts only last full month', async () => {
    const { lastMonthStart } = monthWindows();
    const mid = atMidMonth(lastMonthStart);
    const late = atLateMonth(lastMonthStart);
    await db
        .rawDatabase(TABLE)
        .insert([...rowsForBucket(3, mid), ...rowsForBucket(7, late)]);
    await expect(getEdgeInstances()).resolves.toEqual({
        lastMonth: 5,
        monthBeforeLast: 0,
    });
});

test('counts only month before last', async () => {
    const { monthBeforeLastStart } = monthWindows();
    const mid = atMidMonth(monthBeforeLastStart);
    const late = atLateMonth(monthBeforeLastStart);
    await db
        .rawDatabase(TABLE)
        .insert([...rowsForBucket(2, mid), ...rowsForBucket(5, late)]);
    await expect(getEdgeInstances()).resolves.toEqual({
        lastMonth: 0,
        monthBeforeLast: 4,
    });
});

test('separates months correctly when both have data', async () => {
    const { monthBeforeLastStart, lastMonthStart } = monthWindows();
    const pMid = atMidMonth(monthBeforeLastStart);
    const pLate = atLateMonth(monthBeforeLastStart);
    const lMid = atMidMonth(lastMonthStart);
    const lLate = atLateMonth(lastMonthStart);

    await db
        .rawDatabase(TABLE)
        .insert([
            ...rowsForBucket(4, pMid),
            ...rowsForBucket(6, pLate),
            ...rowsForBucket(3, lMid),
            ...rowsForBucket(7, lLate),
        ]);

    await expect(getEdgeInstances()).resolves.toEqual({
        lastMonth: 5,
        monthBeforeLast: 5,
    });
});

test('ignores current month data', async () => {
    const { thisMonthStart, lastMonthStart } = monthWindows();
    const lMid = atMidMonth(lastMonthStart);
    const lLate = atLateMonth(lastMonthStart);
    const tMid = atMidMonth(thisMonthStart);

    await db
        .rawDatabase(TABLE)
        .insert([
            ...rowsForBucket(10, tMid),
            ...rowsForBucket(2, lMid),
            ...rowsForBucket(4, lLate),
        ]);

    await expect(getEdgeInstances()).resolves.toEqual({
        lastMonth: 3,
        monthBeforeLast: 0,
    });
});
