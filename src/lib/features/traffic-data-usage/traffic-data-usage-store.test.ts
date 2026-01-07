import {
    differenceInCalendarMonths,
    endOfMonth,
    startOfMonth,
    subMonths,
} from 'date-fns';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type {
    ITrafficDataUsageStore,
    IUnleashStores,
} from '../../types/index.js';

let stores: IUnleashStores;
let db: ITestDb;
let trafficDataUsageStore: ITrafficDataUsageStore;

beforeAll(async () => {
    db = await dbInit('traffic_data_usage_serial', getLogger, {
        experimental: {
            flags: {},
        },
    });
    stores = db.stores;
    trafficDataUsageStore = stores.trafficDataUsageStore;
});

afterAll(async () => {
    await db.destroy();
});

beforeEach(async () => {
    await trafficDataUsageStore.deleteAll();
});

test('upsert stores new entries', async () => {
    const data = {
        day: new Date(),
        trafficGroup: 'default',
        statusCodeSeries: 200,
        count: 1,
    };
    await trafficDataUsageStore.upsert(data);
    const data2 = await trafficDataUsageStore.get({
        day: data.day,
        trafficGroup: data.trafficGroup,
        statusCodeSeries: data.statusCodeSeries,
    });
    expect(data2).toBeDefined();
    expect(data2!.count).toBe(1);
});

test('upsert upserts', async () => {
    const data = {
        day: new Date(),
        trafficGroup: 'default2',
        statusCodeSeries: 200,
        count: 1,
    };
    const dataSecondTime = {
        day: new Date(),
        trafficGroup: 'default2',
        statusCodeSeries: 200,
        count: 3,
    };
    await trafficDataUsageStore.upsert(data);
    await trafficDataUsageStore.upsert(dataSecondTime);
    const data2 = await trafficDataUsageStore.get({
        day: data.day,
        trafficGroup: data.trafficGroup,
        statusCodeSeries: data.statusCodeSeries,
    });
    expect(data2).toBeDefined();
    expect(data2!.count).toBe(4);
});

test('getAll returns all', async () => {
    const data1 = {
        day: new Date(),
        trafficGroup: 'default3',
        statusCodeSeries: 200,
        count: 1,
    };
    const data2 = {
        day: new Date(),
        trafficGroup: 'default4',
        statusCodeSeries: 200,
        count: 3,
    };
    await trafficDataUsageStore.upsert(data1);
    await trafficDataUsageStore.upsert(data2);
    const results = await trafficDataUsageStore.getAll();
    expect(results).toBeDefined();
    expect(results.length).toBe(2);
});

test('delete deletes the specified item', async () => {
    const data1 = {
        day: new Date(),
        trafficGroup: 'default3',
        statusCodeSeries: 200,
        count: 1,
    };
    const data2 = {
        day: new Date(),
        trafficGroup: 'default4',
        statusCodeSeries: 200,
        count: 3,
    };
    await trafficDataUsageStore.upsert(data1);
    await trafficDataUsageStore.upsert(data2);
    await trafficDataUsageStore.delete({
        day: data1.day,
        trafficGroup: data1.trafficGroup,
        statusCodeSeries: data1.statusCodeSeries,
    });
    const results = await trafficDataUsageStore.getAll();
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0].trafficGroup).toBe('default4');
});

test('can query for specific items', async () => {
    const data1 = {
        day: new Date(),
        trafficGroup: 'default3',
        statusCodeSeries: 200,
        count: 1,
    };
    const data2 = {
        day: new Date(),
        trafficGroup: 'default4',
        statusCodeSeries: 200,
        count: 3,
    };
    const data3 = {
        day: new Date(),
        trafficGroup: 'default5',
        statusCodeSeries: 200,
        count: 2,
    };
    await trafficDataUsageStore.upsert(data1);
    await trafficDataUsageStore.upsert(data2);
    await trafficDataUsageStore.upsert(data3);

    const results_traffic_group = await trafficDataUsageStore.getAll({
        traffic_group: data1.trafficGroup,
    });
    expect(results_traffic_group).toBeDefined();
    expect(results_traffic_group.length).toBe(1);
    expect(results_traffic_group[0].trafficGroup).toBe('default3');

    const results_day = await trafficDataUsageStore.getAll({
        day: data2.day,
    });
    expect(results_day).toBeDefined();
    expect(results_day.length).toBe(3);

    const results_status_code = await trafficDataUsageStore.getAll({
        status_code_series: 200,
    });
    expect(results_status_code).toBeDefined();
    expect(results_status_code.length).toBe(3);
});

test('can query for data from specific periods', async () => {
    const data1 = {
        day: new Date(2024, 2, 12),
        trafficGroup: 'default-period-query',
        statusCodeSeries: 200,
        count: 1,
    };
    const data2 = {
        day: new Date(2024, 2, 13),
        trafficGroup: 'default-period-query',
        statusCodeSeries: 200,
        count: 3,
    };
    const data3 = {
        day: new Date(2024, 1, 12),
        trafficGroup: 'default-period-query',
        statusCodeSeries: 200,
        count: 2,
    };
    const data4 = {
        day: new Date(2023, 9, 6),
        trafficGroup: 'default-period-query',
        statusCodeSeries: 200,
        count: 12,
    };
    await trafficDataUsageStore.upsert(data1);
    await trafficDataUsageStore.upsert(data2);
    await trafficDataUsageStore.upsert(data3);
    await trafficDataUsageStore.upsert(data4);

    const traffic_period_usage =
        await trafficDataUsageStore.getTrafficDataUsageForPeriod('2024-03');
    expect(traffic_period_usage).toBeDefined();
    expect(traffic_period_usage.length).toBe(2);

    const traffic_period_usage_older =
        await trafficDataUsageStore.getTrafficDataUsageForPeriod('2023-10');
    expect(traffic_period_usage_older).toBeDefined();
    expect(traffic_period_usage_older.length).toBe(1);
    expect(traffic_period_usage_older[0].count).toBe(12);
});

test('can query for monthly aggregation of data for a specified range', async () => {
    const now = new Date();

    const expectedValues: { groupA: number; groupB: number }[] = [];

    // fill in with data for the last 13 months
    for (let i = 0; i <= 12; i++) {
        const then = subMonths(now, i);
        let monthAggregateA = 0;
        let monthAggregateB = 0;
        for (let day = 1; day <= 5; day++) {
            const dayValue = i + day;
            const dayValueB = dayValue * 2;
            monthAggregateA += dayValue;
            monthAggregateB += dayValueB;
            const dataA = {
                day: new Date(then.getFullYear(), then.getMonth(), day),
                trafficGroup: 'groupA',
                statusCodeSeries: 200,
                count: dayValue,
            };
            await trafficDataUsageStore.upsert(dataA);
            const dataB = {
                day: new Date(then.getFullYear(), then.getMonth(), day),
                trafficGroup: 'groupB',
                statusCodeSeries: 200,
                count: dayValueB,
            };
            await trafficDataUsageStore.upsert(dataB);
        }
        expectedValues.push({
            groupA: monthAggregateA,
            groupB: monthAggregateB,
        });
    }

    for (const monthsBack of [3, 6, 12]) {
        const to = endOfMonth(now);
        const from = subMonths(startOfMonth(now), monthsBack);
        const result =
            await trafficDataUsageStore.getMonthlyTrafficDataUsageForPeriod(
                from,
                to,
            );

        // should have the current month and the preceding n months (one entry per group)
        expect(result.length).toBe((monthsBack + 1) * 2);

        for (const entry of result) {
            const index = differenceInCalendarMonths(
                now,
                new Date(entry.month),
            );
            const expectedCount = expectedValues[index];
            expect(entry.count).toBe(expectedCount[entry.trafficGroup]);
        }
    }
});
