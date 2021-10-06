import dbInit, { ITestDb } from '../../helpers/database-init';
import { setupAppWithCustomConfig } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
import { roundDownToHour } from '../../../../lib/services/client-metrics/util';
import { IClientMetricsEnv } from '../../../../lib/types/stores/client-metrics-store-v2';

let app;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('client_metrics_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: { metricsV2: { enabled: true } },
    });
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    await db.reset();
});

test('should return grouped metrics', async () => {
    const date = roundDownToHour(new Date());
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
        .get('/api/admin/client-metrics/features/demo')
        .expect('Content-Type', /json/)
        .expect(200);
    const { body: t2 } = await app.request
        .get('/api/admin/client-metrics/features/t2')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(demo.data).toHaveLength(48);
    expect(demo.data[0].environment).toBe('default');
    expect(demo.data[0].yes_count).toBe(5);
    expect(demo.data[0].no_count).toBe(4);
    expect(demo.data[1].environment).toBe('test');
    expect(demo.data[1].yes_count).toBe(1);
    expect(demo.data[1].no_count).toBe(3);

    expect(t2.data).toHaveLength(24);
    expect(t2.data[0].environment).toBe('default');
    expect(t2.data[0].yes_count).toBe(7);
    expect(t2.data[0].no_count).toBe(104);
});
