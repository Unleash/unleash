import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import metricsExample from '../../../examples/client-metrics.json' with {
    type: 'json',
};
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { ApiTokenType, type IApiToken } from '../../../../lib/types/model.js';
import { TEST_AUDIT_USER } from '../../../../lib/types/index.js';
import { vi } from 'vitest';
import { DEFAULT_ENV } from '../../../../lib/server-impl.js';
let app: IUnleashTest;
let db: ITestDb;

let defaultToken: IApiToken;
beforeAll(async () => {
    db = await dbInit('metrics_two_api_client', getLogger);
    app = await setupAppWithAuth(db.stores, {}, db.rawDatabase);
    defaultToken =
        await app.services.apiTokenService.createApiTokenWithProjects({
            type: ApiTokenType.BACKEND,
            projects: ['default'],
            environment: DEFAULT_ENV,
            tokenName: 'tester',
        });
});

afterEach(async () => {
    await db.stores.clientMetricsStoreV2.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should be possible to send metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metricsExample)
        .expect(202);
});

test('should require valid send metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send({
            appName: 'test',
        })
        .expect(400);
});

test('should accept client metrics', async () => {
    return app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
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

test('should pick up environment from token', async () => {
    const environment = 'test';
    await db.stores.environmentStore.create({ name: 'test', type: 'test' });
    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.BACKEND,
            projects: ['default'],
            environment,
            tokenName: 'tester',
        },
    );

    // @ts-expect-error - cachedFeatureNames is a private property in ClientMetricsServiceV2
    app.services.clientMetricsServiceV2.cachedFeatureNames = vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['test']);

    await app.request
        .post('/api/client/metrics')
        .set('Authorization', token.secret)
        .send({
            appName: 'some-fancy-app',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {
                    test: {
                        yes: 100,
                        no: 50,
                    },
                },
            },
        })
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();
    const metrics = await db.stores.clientMetricsStoreV2.getAll();
    expect(metrics[0].environment).toBe('test');
    expect(metrics[0].appName).toBe('some-fancy-app');
});

test('should set lastSeen for toggles with metrics both for toggle and toggle env', async () => {
    const start = Date.now();
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        { name: 't1' },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        { name: 't2' },
        TEST_AUDIT_USER,
    );

    // @ts-expect-error - cachedFeatureNames is a private property in ClientMetricsServiceV2
    app.services.clientMetricsServiceV2.cachedFeatureNames = vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['t1', 't2']);

    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.BACKEND,
            projects: ['default'],
            environment: DEFAULT_ENV,
            tokenName: 'tester',
        },
    );

    await app.request
        .post('/api/client/metrics')
        .set('Authorization', token.secret)
        .send({
            appName: 'some-fancy-app',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {
                    t1: {
                        yes: 100,
                        no: 50,
                    },
                    t2: {
                        yes: 0,
                        no: 0,
                    },
                },
            },
        })
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();
    await app.services.lastSeenService.store();
    const t1 = await app.services.featureToggleService.getFeature({
        featureName: 't1',
        archived: false,
        environmentVariants: true,
        projectId: 'default',
    });
    const t2 = await app.services.featureToggleService.getFeature({
        featureName: 't2',
        archived: false,
        environmentVariants: true,
        projectId: 'default',
    });

    const t1Env = t1.environments.find((e) => e.name === DEFAULT_ENV);
    const t2Env = t2.environments.find((e) => e.name === DEFAULT_ENV);

    expect(t1.lastSeenAt?.getTime()).toBeGreaterThanOrEqual(start);
    expect(t1Env?.lastSeenAt.getTime()).toBeGreaterThanOrEqual(start);
    expect(t2?.lastSeenAt).toBeDefined();
    expect(t2Env?.lastSeenAt).toBeDefined();
});
