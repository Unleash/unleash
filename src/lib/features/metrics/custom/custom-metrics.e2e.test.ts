import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import type { CustomMetricsService } from './custom-metrics-service.js';
import type { StoredCustomMetric } from './custom-metrics-store.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('metrics_api_admin_custom', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                responseTimeMetricsFix: true,
            },
        },
    });
});

afterEach(async () => {
    const service = app.services.customMetricsService as CustomMetricsService;
    service.clearMetricsForTesting();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
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

    await app.request
        .post('/api/client/metrics/custom')
        .send(customMetricsExample)
        .expect(202);

    const response = await app.request
        .get('/api/admin/custom-metrics')
        .expect(200);

    expect(response.body).toHaveProperty('metrics');
    expect(response.body).toHaveProperty('count');
    expect(response.body).toHaveProperty('metricNames');
    expect(response.body.count).toBeGreaterThan(0);
    expect(response.body.metricNames).toContain('test_metric');

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

test('should expose metrics in Prometheus format', async () => {
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

    const response = await app.request
        .get('/api/admin/custom-metrics/prometheus')
        .expect(200);

    expect(response.headers['content-type']).toContain('text/plain');

    const metricsText = response.text;

    expect(metricsText).toContain('# HELP api_requests_total');
    expect(metricsText).toContain('# TYPE api_requests_total counter');
    expect(metricsText).toContain('# HELP memory_usage');
    expect(metricsText).toContain('# TYPE memory_usage counter');

    expect(metricsText).toMatch(
        /api_requests_total{status="200",endpoint="\/api\/test"} 10/,
    );
    expect(metricsText).toMatch(
        /api_requests_total{status="404",endpoint="\/api\/missing"} 5/,
    );
    expect(metricsText).toMatch(/memory_usage{application="unleash"} 1024/);
});

test('should deduplicate metrics, round timestamps, and preserve different labels', async () => {
    await app.request
        .post('/api/client/metrics/custom')
        .send({
            metrics: [
                {
                    name: 'test_counter',
                    value: 1,
                    labels: {
                        instance: 'server1',
                    },
                },
                {
                    name: 'test_counter',
                    value: 5,
                    labels: {
                        instance: 'server2',
                    },
                },
                {
                    name: 'memory_usage',
                    value: 100,
                    labels: {
                        server: 'main',
                    },
                },
            ],
        })
        .expect(202);

    await app.request
        .post('/api/client/metrics/custom')
        .send({
            metrics: [
                {
                    name: 'test_counter',
                    value: 2,
                    labels: {
                        instance: 'server1',
                    },
                },
                {
                    name: 'memory_usage',
                    value: 200,
                    labels: {
                        server: 'main',
                    },
                },
                {
                    name: 'memory_usage',
                    value: 150,
                    labels: {
                        server: 'backup',
                    },
                },
            ],
        })
        .expect(202);

    const response = await app.request
        .get('/api/admin/custom-metrics')
        .expect(200);

    expect(response.body).toHaveProperty('metrics');
    expect(response.body).toHaveProperty('count');
    expect(response.body).toHaveProperty('metricNames');

    const metrics = response.body.metrics as StoredCustomMetric[];

    expect(response.body.count).toBe(4);

    const testCounterServer1 = metrics.find(
        (m) => m.name === 'test_counter' && m.labels?.instance === 'server1',
    );
    expect(testCounterServer1).toBeDefined();
    expect(testCounterServer1?.value).toBe(2);

    const testCounterServer2 = metrics.find(
        (m) => m.name === 'test_counter' && m.labels?.instance === 'server2',
    );
    expect(testCounterServer2).toBeDefined();
    expect(testCounterServer2?.value).toBe(5);

    const memoryUsageMain = metrics.find(
        (m) => m.name === 'memory_usage' && m.labels?.server === 'main',
    );
    expect(memoryUsageMain).toBeDefined();
    expect(memoryUsageMain?.value).toBe(200);

    const memoryUsageBackup = metrics.find(
        (m) => m.name === 'memory_usage' && m.labels?.server === 'backup',
    );
    expect(memoryUsageBackup).toBeDefined();
    expect(memoryUsageBackup?.value).toBe(150);

    metrics.forEach((metric) => {
        const date = new Date(metric.timestamp);
        expect(date.getSeconds()).toBe(0);
        expect(date.getMilliseconds()).toBe(0);
    });

    const prometheusResponse = await app.request
        .get('/api/admin/custom-metrics/prometheus')
        .expect(200);

    const prometheusOutput = prometheusResponse.text;

    expect(prometheusOutput).toMatch(/test_counter{instance="server1"} 2/);
    expect(prometheusOutput).toMatch(/test_counter{instance="server2"} 5/);
    expect(prometheusOutput).toMatch(/memory_usage{server="main"} 200/);
    expect(prometheusOutput).toMatch(/memory_usage{server="backup"} 150/);
});
