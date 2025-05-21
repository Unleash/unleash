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

test('should store custom metrics in memory and be able to retrieve them', async () => {
    const customMetricsExample = {
        metrics: [
            {
                name: 'test_metric',
                value: 42,
                labels: {
                    env: 'test',
                    component: 'api',
                },
            },
        ],
    };

    // Send the custom metrics
    await app.request
        .post('/api/client/metrics/custom')
        .send(customMetricsExample)
        .expect(202);

    // Retrieve the stored metrics
    const response = await app.request
        .get('/api/client/metrics/custom')
        .expect(200);

    // Check that our metrics are stored
    expect(response.body).toHaveProperty('metrics');
    expect(response.body).toHaveProperty('count');
    expect(response.body).toHaveProperty('metricNames');
    expect(response.body.count).toBeGreaterThan(0);
    expect(response.body.metricNames).toContain('test_metric');

    // Check that our metric is in the response
    const metrics = response.body.metrics;
    const found = metrics.some(
        (metric) =>
            metric.name === 'test_metric' &&
            metric.value === 42 &&
            metric.labels &&
            metric.labels.env === 'test' &&
            metric.labels.component === 'api',
    );

    expect(found).toBe(true);
});

test('should be able to retrieve metrics by name', async () => {
    // Send metrics with different names
    await app.request
        .post('/api/client/metrics/custom')
        .send({
            metrics: [
                {
                    name: 'http_requests',
                    value: 1,
                    labels: { method: 'GET' },
                },
                {
                    name: 'database_queries',
                    value: 5,
                    labels: { type: 'select' },
                },
            ],
        })
        .expect(202);

    // Retrieve metrics for http_requests
    const response = await app.request
        .get('/api/client/metrics/custom/http_requests')
        .expect(200);

    // Check response
    expect(response.body).toHaveProperty('name', 'http_requests');
    expect(response.body).toHaveProperty('metrics');
    expect(response.body).toHaveProperty('count');
    expect(response.body.count).toBeGreaterThan(0);

    // Check metric content
    const metrics = response.body.metrics;
    expect(metrics[0].name).toBe('http_requests');
    expect(metrics[0].value).toBe(1);
    expect(metrics[0].labels.method).toBe('GET');

    // Check 404 for non-existent metric
    await app.request
        .get('/api/client/metrics/custom/non_existent_metric')
        .expect(404);
});

test('should expose metrics in Prometheus format', async () => {
    // Send some test metrics
    await app.request
        .post('/api/client/metrics/custom')
        .send({
            metrics: [
                {
                    name: 'api_requests_total',
                    value: 10,
                    labels: {
                        status: '200',
                        endpoint: '/api/test',
                    },
                },
                {
                    name: 'api_requests_total',
                    value: 5,
                    labels: {
                        status: '404',
                        endpoint: '/api/missing',
                    },
                },
                {
                    name: 'memory_usage',
                    value: 1024,
                    labels: {
                        application: 'unleash',
                    },
                },
            ],
        })
        .expect(202);

    // Retrieve Prometheus formatted metrics
    const response = await app.request
        .get('/api/client/metrics/prometheus')
        .expect(200);

    // Check content type is text/plain
    expect(response.headers['content-type']).toContain('text/plain');

    // Check the response contains Prometheus formatted metrics
    const metricsText = response.text;

    // Check for HELP and TYPE comments
    expect(metricsText).toContain('# HELP api_requests_total');
    expect(metricsText).toContain('# TYPE api_requests_total counter');
    expect(metricsText).toContain('# HELP memory_usage');
    expect(metricsText).toContain('# TYPE memory_usage counter');

    // Check for metric values with labels
    expect(metricsText).toMatch(
        /api_requests_total{status="200",endpoint="\/api\/test"} 10/,
    );
    expect(metricsText).toMatch(
        /api_requests_total{status="404",endpoint="\/api\/missing"} 5/,
    );
    expect(metricsText).toMatch(/memory_usage{application="unleash"} 1024/);
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
