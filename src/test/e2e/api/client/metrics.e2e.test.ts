import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import metricsExample from '../../../examples/client-metrics.json';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { REQUEST_TIME } from '../../../../lib/metric-events';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('metrics_api_client', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                responseTimeMetricsFix: true,
            },
        },
    });
});

afterEach(async () => {
    await Promise.all([
        db.stores.clientMetricsStoreV2.deleteAll(),
        db.stores.clientInstanceStore.deleteAll(),
    ]);
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

test('should create instance if does not exist', async () => {
    const instances = await db.stores.clientInstanceStore.getAll();
    expect(instances.length).toBe(0);
    await app.request
        .post('/api/client/metrics')
        .send(metricsExample)
        .expect(202);
    const finalInstances = await db.stores.clientInstanceStore.getAll();
    expect(finalInstances.length).toBe(1);
});

test('should emit response time metrics data in the correct path', async () => {
    const badMetrics = {
        ...metricsExample,
        bucket: { ...metricsExample.bucket, stop: null },
    };

    let timeInfo = undefined;
    app.config.eventBus.on(REQUEST_TIME, (data) => {
        timeInfo = data;
    });

    await app.request.post('/api/client/metrics').send(badMetrics).expect(400);

    // wait in a loop of 10 milliseconds step while triggered is false
    // or until 1000 milliseconds have passed
    while (timeInfo === undefined) {
        console.log('Waiting for event to be triggered');
        await new Promise((resolve) => setTimeout(resolve, 10));
    }

    expect(timeInfo).toMatchObject({
        method: 'POST',
        statusCode: 400,
        path: '/api/client/metrics',
    });
    app.config.eventBus.removeAllListeners();
});
