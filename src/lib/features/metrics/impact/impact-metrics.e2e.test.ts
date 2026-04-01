import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import type { NumericMetric, BucketMetric } from './metrics-translator.js';

let app: IUnleashTest;
let db: ITestDb;

const sendImpactMetrics = async (
    impactMetrics: (NumericMetric | BucketMetric)[],
    status = 202,
) =>
    app.request
        .post('/api/client/metrics')
        .send({
            appName: 'impact-metrics-app',
            instanceId: 'instance-id',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {},
            },
            impactMetrics,
        })
        .expect(status);

const sendBulkMetricsWithImpact = async (
    impactMetrics: (NumericMetric | BucketMetric)[],
    status = 202,
) => {
    return app.request
        .post('/api/client/metrics/bulk')
        .send({
            applications: [],
            metrics: [],
            impactMetrics,
        })
        .expect(status);
};

beforeAll(async () => {
    db = await dbInit('impact_metrics', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                impactMetrics: true,
            },
        },
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should store impact metrics in memory and be able to retrieve them', async () => {
    await sendImpactMetrics([
        {
            name: 'labeled_counter',
            help: 'with labels',
            type: 'counter',
            samples: [
                {
                    labels: { foo: 'bar' },
                    value: 5,
                },
            ],
        },
    ]);

    await sendImpactMetrics([
        {
            name: 'labeled_counter',
            help: 'with labels',
            type: 'counter',
            samples: [
                {
                    labels: { foo: 'bar' },
                    value: 10,
                },
            ],
        },
    ]);

    await sendImpactMetrics([]);
    // missing help = no error but value ignored
    await sendImpactMetrics(
        [
            // @ts-expect-error
            {
                name: 'labeled_counter',
                type: 'counter',
                samples: [
                    {
                        labels: { foo: 'bar' },
                        value: 10,
                    },
                ],
            },
        ],
        202,
    );

    const response = await app.request
        .get('/internal-backstage/impact/metrics')
        .expect('Content-Type', /text/)
        .expect(200);

    const metricsText = response.text;

    expect(metricsText).toContain('# HELP labeled_counter with labels');
    expect(metricsText).toContain('# TYPE labeled_counter counter');
    expect(metricsText).toMatch(
        /labeled_counter{origin="sdk",metric_type="counter",foo="bar"} 15/,
    );
});

test('should store impact metrics sent via bulk metrics endpoint', async () => {
    await sendBulkMetricsWithImpact([
        {
            name: 'bulk_counter',
            help: 'bulk counter with labels',
            type: 'counter',
            samples: [
                {
                    labels: { source: 'bulk' },
                    value: 7,
                },
            ],
        },
    ]);

    await sendBulkMetricsWithImpact([
        {
            name: 'bulk_counter',
            help: 'bulk counter with labels',
            type: 'counter',
            samples: [
                {
                    labels: { source: 'bulk' },
                    value: 8,
                },
            ],
        },
    ]);

    await sendBulkMetricsWithImpact([]);

    const response = await app.request
        .get('/internal-backstage/impact/metrics')
        .expect('Content-Type', /text/)
        .expect(200);

    const metricsText = response.text;

    expect(metricsText).toContain(
        '# HELP bulk_counter bulk counter with labels',
    );
    expect(metricsText).toContain('# TYPE bulk_counter counter');
    expect(metricsText).toMatch(
        /bulk_counter{origin="sdk",metric_type="counter",source="bulk"} 15/,
    );
});

test('should store histogram metrics with batch data', async () => {
    await sendImpactMetrics([
        {
            name: 'response_time',
            help: 'Response time histogram',
            type: 'histogram',
            samples: [
                {
                    labels: { foo: 'bar' },
                    count: 10,
                    sum: 8.5,
                    buckets: [
                        { le: 1, count: 7 },
                        { le: '+Inf', count: 10 },
                    ],
                },
            ],
        },
    ]);

    await sendImpactMetrics([
        {
            name: 'response_time',
            help: 'Response time histogram',
            type: 'histogram',
            samples: [
                {
                    labels: { foo: 'bar' },
                    count: 5,
                    sum: 3.2,
                    buckets: [
                        { le: 1, count: 3 },
                        { le: '+Inf', count: 5 },
                    ],
                },
            ],
        },
    ]);

    const response = await app.request
        .get('/internal-backstage/impact/metrics')
        .expect('Content-Type', /text/)
        .expect(200);

    const metricsText = response.text;

    expect(metricsText).toContain(
        '# HELP response_time Response time histogram',
    );
    expect(metricsText).toContain('# TYPE response_time histogram');
    expect(metricsText).toContain(
        'response_time_bucket{foo="bar",metric_type="histogram",origin="sdk",le="1"} 10',
    );
    expect(metricsText).toContain(
        'response_time_bucket{foo="bar",metric_type="histogram",origin="sdk",le="+Inf"} 15',
    );
    expect(metricsText).toContain(
        'response_time_sum{foo="bar",metric_type="histogram",origin="sdk"} 11.7',
    );
    expect(metricsText).toContain(
        'response_time_count{foo="bar",metric_type="histogram",origin="sdk"} 15',
    );
});
