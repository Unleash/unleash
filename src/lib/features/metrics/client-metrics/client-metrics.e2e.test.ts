import dbInit, { ITestDb } from '../../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';
import { IClientMetricsEnv } from './client-metrics-store-v2-type';
import { subHours } from 'date-fns';

let app: IUnleashTest;
let db: ITestDb;

const fetchHoursBack = (hoursBack: number, feature: string = 'demo') => {
    return app.request
        .get(
            `/api/admin/client-metrics/features/${feature}/raw?hoursBack=${hoursBack}`,
        )
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => res.body);
};

beforeAll(async () => {
    db = await dbInit('client_metrics_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    extendedUsageMetrics: true,
                },
            },
        },
        db.rawDatabase,
    );
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

    expect(demo.data).toHaveLength(48);
    expect(demo.data[46].environment).toBe('default');
    expect(demo.data[46].yes).toBe(5);
    expect(demo.data[46].no).toBe(4);
    expect(demo.data[47].environment).toBe('test');
    expect(demo.data[47].yes).toBe(1);
    expect(demo.data[47].no).toBe(3);

    expect(t2.data).toHaveLength(24);
    expect(t2.data[23].environment).toBe('default');
    expect(t2.data[23].yes).toBe(7);
    expect(t2.data[23].no).toBe(104);
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
    await db.stores.clientMetricsStoreV2.aggregateDailyMetrics();

    const hours1 = await fetchHoursBack(1);
    const hours24 = await fetchHoursBack(24);
    const hours48 = await fetchHoursBack(48);
    const hoursTooFew = await fetchHoursBack(-999);
    const hoursTooMany = await fetchHoursBack(24 * 31 * 3 + 1); // 3 months + 1 hour
    const days = await fetchHoursBack(48 + 1); // switch to days after 48 hours

    expect(hours1.data).toHaveLength(1);
    expect(hours24.data).toHaveLength(24);
    expect(hours48.data).toHaveLength(48);
    expect(hoursTooFew.data).toHaveLength(24);
    expect(hoursTooMany.data).toHaveLength(24);
    expect(days.data).toHaveLength(2); // two days of data
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

test('should support posting and receiving variants data', async () => {
    const date = new Date();
    const metric = {
        featureName: 'demo',
        appName: 'web',
        environment: 'default',
        timestamp: date,
        yes: 7,
        no: 1,
        variants: { red: 3, blue: 4 },
    };
    const metrics: IClientMetricsEnv[] = [metric];

    await db.stores.clientMetricsStoreV2.batchInsertMetrics(metrics);

    const hours1 = await fetchHoursBack(1);

    expect(hours1.data[0].variants).toMatchObject(metric.variants);
});
