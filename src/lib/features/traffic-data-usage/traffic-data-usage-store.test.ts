import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import type { ITrafficDataUsageStore, IUnleashStores } from '../../types';

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
    expect(data2.count).toBe(1);
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
    expect(data2.count).toBe(4);
});

test('getAll returns all', async () => {
    await trafficDataUsageStore.deleteAll();
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
    await trafficDataUsageStore.deleteAll();
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
    await trafficDataUsageStore.deleteAll();
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
    await trafficDataUsageStore.deleteAll();
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
