import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import type { CustomMetricsService } from './custom-metrics-service.js';

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
    // Clear any custom metrics using the testing method
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

    // Send the custom metrics
    await app.request
        .post('/api/client/metrics/custom')
        .send(customMetricsExample)
        .expect(202);

    // Retrieve the stored metrics from admin API
    const response = await app.request
        .get('/api/admin/custom-metrics')
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

    // Retrieve Prometheus formatted metrics from admin API (using the correct path)
    const response = await app.request
        .get('/api/admin/custom-metrics/prometheus')
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
