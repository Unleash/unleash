import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import metricsExample from '../../../examples/client-metrics.json';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { ApiTokenType } from '../../../../lib/types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;

let defaultToken;

beforeAll(async () => {
    db = await dbInit('metrics_two_api_client', getLogger);
    app = await setupAppWithAuth(db.stores, {});
    defaultToken = await app.services.apiTokenService.createApiToken({
        type: ApiTokenType.CLIENT,
        project: 'default',
        environment: 'default',
        username: 'tester',
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
    const token = await app.services.apiTokenService.createApiToken({
        type: ApiTokenType.CLIENT,
        project: 'default',
        environment,
        username: 'tester',
    });

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

test('should set lastSeen for toggles with metrics', async () => {
    const start = Date.now();
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        { name: 't1' },
        'tester',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        { name: 't2' },
        'tester',
    );
    const token = await app.services.apiTokenService.createApiToken({
        type: ApiTokenType.CLIENT,
        project: 'default',
        environment: 'default',
        username: 'tester',
    });

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
    const t1 = await db.stores.featureToggleStore.get('t1');
    const t2 = await db.stores.featureToggleStore.get('t2');
    expect(t1.lastSeenAt.getTime()).toBeGreaterThanOrEqual(start);
    expect(t2.lastSeenAt).toBeDefined();
});
