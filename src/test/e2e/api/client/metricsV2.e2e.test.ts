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
    app = await setupAppWithAuth(db.stores, {
        experimental: { metricsV2: { enabled: true } },
    });
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
