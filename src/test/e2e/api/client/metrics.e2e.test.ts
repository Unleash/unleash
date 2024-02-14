import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import metricsExample from '../../../examples/client-metrics.json';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('metrics_api_client', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should be possible to send metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .send(metricsExample)
        .expect(202);
});

test('should require valid send metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .send({
            appName: 'test',
        })
        .expect(400);
});

test('should accept empty client metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {},
            },
        })
        .expect(202);
});

test('should tag metrics under default environment when set to authtype.none', async () => {
    await app.request
        .post('/api/client/metrics')
        .send(metricsExample)
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();
    const metrics = await db.stores.clientMetricsStoreV2.getAll();
    const toggle1 = metrics.filter((m) => m.featureName === 'toggle-name-1')[0];
    const toggle2 = metrics.filter((m) => m.featureName === 'toggle-name-2')[0];

    expect(toggle1.environment).toBe('default');
    expect(toggle2.environment).toBe('default');
});
