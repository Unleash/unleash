import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import { minutesToMilliseconds } from 'date-fns';

let app: IUnleashTest;
let db: ITestDb;

const postAndFlushBulkMetrics = async (
    body: Record<string, any>,
    status: number,
): Promise<void> => {
    await app.request
        .post('/api/client/metrics/bulk')
        .send(body)
        .expect(status);
    // flush metrics to the database
    await app.services.clientMetricsServiceV2.bulkAdd();
    await app.services.clientInstanceService.bulkAdd();
};

beforeAll(async () => {
    db = await dbInit('bulk_metrics_rejections', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
            metricsRateLimiting: {
                clientMetricsMaxPerMinute: 1000,
                frontendMetricsMaxPerMinute: 1000,
                frontendRegisterMaxPerMinute: 1000,
                source: 'predefined',
                enable: false,
                enabledWarning: false,
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app?.destroy();
    await db?.destroy();
});

afterEach(async () => {
    await db.stores.clientApplicationsStore.deleteAll?.();
    await db.stores.clientInstanceStore.deleteAll?.();
});

test('returns 400 and stores nothing when applications contain invalid registrations and metrics also fail validation', async () => {
    const started = new Date().toISOString();
    await postAndFlushBulkMetrics(
        {
            applications: [
                {
                    appName: null,
                    instanceId: 'instance-1',
                    environment: 'development',
                    interval: minutesToMilliseconds(1),
                    started,
                    strategies: ['default'],
                },
            ],
            metrics: [
                {
                    featureName: 'demo-toggle',
                    appName: null,
                    environment: 'development',
                    timestamp: new Date().toISOString(),
                    yes: 1,
                    no: 0,
                    variants: { variantA: 1 },
                },
            ],
        },
        400,
    );

    const apps = await db.stores.clientApplicationsStore.getAll();
    const instances = await db.stores.clientInstanceStore.getAll();

    expect(apps).toHaveLength(0);
    expect(instances).toHaveLength(0);
});

test('returns 400 and stores nothing when application registration rejects but metrics are otherwise valid', async () => {
    const started = new Date().toISOString();
    await postAndFlushBulkMetrics(
        {
            applications: [
                {
                    appName: null,
                    instanceId: 'instance-1',
                    environment: 'development',
                    interval: minutesToMilliseconds(1),
                    started,
                    strategies: ['default'],
                },
            ],
            metrics: [
                {
                    featureName: 'demo-toggle',
                    appName: 'edge-client',
                    environment: 'development',
                    timestamp: new Date().toISOString(),
                    yes: 1,
                    no: 0,
                    variants: { variantA: 1 },
                },
            ],
        },
        400,
    );

    const apps = await db.stores.clientApplicationsStore.getAll();
    const instances = await db.stores.clientInstanceStore.getAll();

    expect(apps).toHaveLength(0);
    expect(instances).toHaveLength(0);
});

test('accepts valid bulk payload and stores registrations and instances', async () => {
    const started = new Date().toISOString();
    await postAndFlushBulkMetrics(
        {
            applications: [
                {
                    appName: 'valid-app',
                    instanceId: 'instance-1',
                    environment: 'development',
                    interval: minutesToMilliseconds(1),
                    started,
                    strategies: ['default'],
                },
            ],
            metrics: [
                {
                    featureName: 'demo-toggle',
                    appName: 'valid-app',
                    environment: 'development',
                    timestamp: new Date().toISOString(),
                    yes: 1,
                    no: 0,
                    variants: { variantA: 1 },
                },
            ],
        },
        202,
    );

    const apps = await db.stores.clientApplicationsStore.getAll();
    const instances = await db.stores.clientInstanceStore.getAll();

    expect(apps.length).toBe(1);
    expect(apps[0].appName).toBe('valid-app');
    expect(instances.length).toBe(1);
    expect(instances[0].appName).toBe('valid-app');
    expect(instances[0].instanceId).toBe('instance-1');
});

test('does not emit unhandled rejections when application registration rejects and metrics validation fails', async () => {
    const unhandled: unknown[] = [];
    const handler = (reason: unknown) => {
        unhandled.push(reason);
    };
    process.on('unhandledRejection', handler);

    try {
        await postAndFlushBulkMetrics(
            {
                applications: [
                    {
                        appName: null,
                        instanceId: 'instance-1',
                        environment: 'development',
                        interval: minutesToMilliseconds(1),
                        started: new Date().toISOString(),
                        strategies: ['default'],
                    },
                ],
                metrics: [
                    {
                        featureName: 'demo-toggle',
                        appName: null,
                        environment: 'development',
                        timestamp: new Date().toISOString(),
                        yes: 1,
                        no: 0,
                        variants: { variantA: 1 },
                    },
                ],
            },
            400,
        );

        // Let any pending unhandled rejections surface
        await new Promise((resolve) => setTimeout(resolve, 1000));

        expect(unhandled).toHaveLength(0);
    } finally {
        process.off('unhandledRejection', handler);
    }
});
