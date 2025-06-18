import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { MetricsTranslator } from './metrics-translator.js';
import { impactRegister } from './impact-register.js';

let app: IUnleashTest;
let db: ITestDb;

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
    // TODO: replace with POST metrics when it's ready
    const metricsTranslator = new MetricsTranslator(impactRegister);

    metricsTranslator.translateMetric({
        name: 'labeled_counter',
        help: 'with labels',
        type: 'counter' as const,
        samples: [
            {
                labels: { foo: 'bar' },
                value: 5,
            },
        ],
    });

    metricsTranslator.translateMetric({
        name: 'labeled_counter',
        help: 'with labels',
        type: 'counter' as const,
        samples: [
            {
                labels: { foo: 'bar' },
                value: 10,
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
    expect(metricsText).toMatch(/labeled_counter{foo="bar"} 15/);
});
