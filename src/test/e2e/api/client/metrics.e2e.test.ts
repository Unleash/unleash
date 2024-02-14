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
    await db.stores.featureToggleStore.create('default', {
        name: 'toggle-name-1',
        type: 'release',
    });
    await db.stores.featureToggleStore.create('default', {
        name: 'toggle-name-2',
        type: 'release',
    });
    const metrics = await app.request.get(
        `/api/admin/client-metrics/features/toggle-name-2/raw?hoursBack=48`,
    );
    console.log(metrics.body);
    expect(metrics.body.data.length).toBeGreaterThan(0);
});
