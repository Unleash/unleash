import dbInit, { ITestDb } from '../../helpers/database-init';
import { setupAppWithCustomConfig } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
import { IClientMetricsEnv } from '../../../../lib/types/stores/client-metrics-store-v2';
import { subHours } from 'date-fns';

let app;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('client_metrics_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {});
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    await db.reset();
    await db.stores.clientMetricsStoreV2.deleteAll();
});

test('should return raw metrics, aggregated on key', async () => {
    const date = new Date();
    const metrics: IClientMetricsEnv[] = [
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 2,
            no: 2,
        },
        {
            featureName: 't2',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 5,
            no: 5,
        },
        {
            featureName: 't2',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 2,
            no: 99,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 3,
            no: 2,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'test',
            timestamp: date,
            yes: 1,
            no: 3,
        },
    ];

    await db.stores.clientMetricsStoreV2.batchInsertMetrics(metrics);

    const { body: demo } = await app.request
        .get('/api/admin/client-metrics/features/demo/raw')
        .expect('Content-Type', /json/)
        .expect(200);
    const { body: t2 } = await app.request
        .get('/api/admin/client-metrics/features/t2/raw')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(demo.data).toHaveLength(2);
    expect(demo.data[0].environment).toBe('default');
    expect(demo.data[0].yes).toBe(5);
    expect(demo.data[0].no).toBe(4);
    expect(demo.data[1].environment).toBe('test');
    expect(demo.data[1].yes).toBe(1);
    expect(demo.data[1].no).toBe(3);

    expect(t2.data).toHaveLength(1);
    expect(t2.data[0].environment).toBe('default');
    expect(t2.data[0].yes).toBe(7);
    expect(t2.data[0].no).toBe(104);
});

test('should support the hoursBack query param for raw metrics', async () => {
    const date = new Date();
    const metrics: IClientMetricsEnv[] = [
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 1,
            no: 1,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: subHours(date, 12),
            yes: 2,
            no: 2,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: subHours(date, 32),
            yes: 3,
            no: 3,
        },
    ];

    await db.stores.clientMetricsStoreV2.batchInsertMetrics(metrics);

    const fetchHoursBack = (hoursBack: number) => {
        return app.request
            .get(
                `/api/admin/client-metrics/features/demo/raw?hoursBack=${hoursBack}`,
            )
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => res.body);
    };

    const hours1 = await fetchHoursBack(1);
    const hours24 = await fetchHoursBack(24);
    const hours48 = await fetchHoursBack(48);
    const hoursTooFew = await fetchHoursBack(-999);
    const hoursTooMany = await fetchHoursBack(999);

    expect(hours1.data).toHaveLength(1);
    expect(hours24.data).toHaveLength(2);
    expect(hours48.data).toHaveLength(3);
    expect(hoursTooFew.data).toHaveLength(2);
    expect(hoursTooMany.data).toHaveLength(2);
});

test('should return toggle summary', async () => {
    const date = new Date();
    const metrics: IClientMetricsEnv[] = [
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 2,
            no: 2,
        },
        {
            featureName: 't2',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 5,
            no: 5,
        },
        {
            featureName: 't2',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 2,
            no: 99,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: date,
            yes: 3,
            no: 2,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'test',
            timestamp: date,
            yes: 1,
            no: 3,
        },
        {
            featureName: 'demo',
            appName: 'backend-api',
            environment: 'test',
            timestamp: date,
            yes: 1,
            no: 3,
        },
    ];

    await db.stores.clientMetricsStoreV2.batchInsertMetrics(metrics);

    const { body: demo } = await app.request
        .get('/api/admin/client-metrics/features/demo')
        .expect('Content-Type', /json/)
        .expect(200);

    const test = demo.lastHourUsage.find((u) => u.environment === 'test');
    const defaultEnv = demo.lastHourUsage.find(
        (u) => u.environment === 'default',
    );

    expect(demo.featureName).toBe('demo');
    expect(demo.lastHourUsage).toHaveLength(2);
    expect(test.environment).toBe('test');
    expect(test.yes).toBe(2);
    expect(test.no).toBe(6);
    expect(defaultEnv.environment).toBe('default');
    expect(defaultEnv.yes).toBe(5);
    expect(defaultEnv.no).toBe(4);
    expect(demo.seenApplications).toStrictEqual(['backend-api', 'web']);
});

test('should only include last hour of metrics return toggle summary', async () => {
    const now = new Date();
    const dateTwoHoursAgo = subHours(now, 2);
    const metrics: IClientMetricsEnv[] = [
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: now,
            yes: 2,
            no: 2,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'default',
            timestamp: now,
            yes: 3,
            no: 2,
        },
        {
            featureName: 'demo',
            appName: 'web',
            environment: 'test',
            timestamp: now,
            yes: 1,
            no: 3,
        },
        {
            featureName: 'demo',
            appName: 'backend-api',
            environment: 'test',
            timestamp: now,
            yes: 1,
            no: 3,
        },
        {
            featureName: 'demo',
            appName: 'backend-api',
            environment: 'test',
            timestamp: dateTwoHoursAgo,
            yes: 55,
            no: 55,
        },
    ];

    await db.stores.clientMetricsStoreV2.batchInsertMetrics(metrics);

    const { body: demo } = await app.request
        .get('/api/admin/client-metrics/features/demo')
        .expect('Content-Type', /json/)
        .expect(200);

    const test = demo.lastHourUsage.find((u) => u.environment === 'test');
    const defaultEnv = demo.lastHourUsage.find(
        (u) => u.environment === 'default',
    );

    expect(demo.featureName).toBe('demo');
    expect(demo.lastHourUsage).toHaveLength(2);
    expect(defaultEnv.environment).toBe('default');
    expect(defaultEnv.yes).toBe(5);
    expect(defaultEnv.no).toBe(4);
    expect(test.environment).toBe('test');
    expect(test.yes).toBe(2);
    expect(test.no).toBe(6);
    expect(demo.seenApplications).toStrictEqual(['backend-api', 'web']);
});
