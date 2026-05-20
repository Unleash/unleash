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

type Bucket = { start: number; stop: number; toggles: object };

type ImpactMetricsBody = {
    impactMetrics?: (NumericMetric | BucketMetric)[];
    bucket?: Bucket | null;
};

const sendMetrics = async (data: ImpactMetricsBody = {}, status = 202) => {
    const { impactMetrics = [] } = data;
    const body: Record<string, unknown> = {
        appName: 'impact-metrics-app',
        instanceId: 'instance-id',
        impactMetrics,
    };
    // bucket defaults to null when the key is omitted; passing `bucket: undefined`
    // explicitly drops it from the body.
    const bucket = 'bucket' in data ? data.bucket : null;
    if (bucket !== undefined) {
        body.bucket = bucket;
    }
    return app.request.post('/api/client/metrics').send(body).expect(status);
};

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
    await sendMetrics({
        impactMetrics: [
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
        ],
    });

    await sendMetrics({
        impactMetrics: [
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
        ],
    });

    await sendMetrics({ impactMetrics: [] });
    // missing help = no error but value ignored
    await sendMetrics({
        impactMetrics: [
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
    });

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

test('accepts impact metrics regardless of bucket shape', async () => {
    // bucket explicitly null
    await sendMetrics({ bucket: null });
    // bucket key omitted from the body entirely
    await sendMetrics({ bucket: undefined });
    // bucket present but with no toggles
    await sendMetrics({
        bucket: { start: Date.now(), stop: Date.now(), toggles: {} },
    });
});

test('should store histogram metrics with batch data', async () => {
    await sendMetrics({
        impactMetrics: [
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
        ],
    });

    await sendMetrics({
        impactMetrics: [
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
        ],
    });

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
