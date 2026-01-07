import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import metricsExample from '../../../examples/client-metrics.json' with {
    type: 'json',
};
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { REQUEST_TIME } from '../../../../lib/metric-events.js';

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
    await app.services.clientInstanceService.bulkAdd(); // flush
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
    await app.services.clientInstanceService.bulkAdd();
    const finalInstances = await db.stores.clientInstanceStore.getAll();
    expect(finalInstances.length).toBe(1);
});

test('should accept custom metrics', async () => {
    const customMetricsExample = {
        metrics: [
            {
                name: 'http_responses_total',
                value: 1,
                labels: {
                    status: '200',
                    method: 'GET',
                },
            },
            {
                name: 'http_responses_total',
                value: 1,
                labels: {
                    status: '304',
                    method: 'GET',
                },
            },
        ],
    };

    return app.request
        .post('/api/client/metrics/custom')
        .send(customMetricsExample)
        .expect(202);
});

test('should reject invalid custom metrics', async () => {
    const invalidCustomMetrics = {
        data: [
            {
                name: 'http_responses_total',
                value: 1,
            },
        ],
    };

    return app.request
        .post('/api/client/metrics/custom')
        .send(invalidCustomMetrics)
        .expect(400);
});

test('should emit response time metrics data in the correct path', async () => {
    const badMetrics = {
        ...metricsExample,
        bucket: { ...metricsExample.bucket, stop: null },
    };
    // biome-ignore lint/suspicious/noImplicitAnyLet: data is unknown here
    let timeInfo;
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
