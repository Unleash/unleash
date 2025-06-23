import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import type { Metric } from './metrics-translator.js';

let app: IUnleashTest;
let db: ITestDb;

const sendImpactMetrics = async (impactMetrics: Metric[], status = 202) =>
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
    // missing help
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
        400,
    );

    const response = await app.request
        .get('/internal-backstage/impact/metrics')
        .expect('Content-Type', /text/)
        .expect(200);

    const metricsText = response.text;

    expect(metricsText).toContain('# HELP labeled_counter with labels');
    expect(metricsText).toContain('# TYPE labeled_counter counter');
    expect(metricsText).toMatch(/labeled_counter{foo="bar"} 15/);
});
