import dbInit, { ITestDb } from '../../helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
import {
    ApiTokenType,
    IApiToken,
} from '../../../../lib/types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;
let defaultToken: IApiToken;

const metrics = {
    appName: 'appName',
    instanceId: 'instanceId',
    bucket: {
        start: '2016-11-03T07:16:43.572Z',
        stop: '2016-11-03T07:16:53.572Z',
        toggles: {
            'toggle-name-1': {
                yes: 123,
                no: 321,
                variants: {
                    'variant-1': 123,
                    'variant-2': 321,
                },
            },
            'toggle-name-2': {
                yes: 123,
                no: 321,
                variants: {
                    'variant-1': 123,
                    'variant-2': 321,
                },
            },
            'toggle-name-3': {
                yes: 123,
                no: 321,
                variants: {
                    'variant-1': 123,
                    'variant-2': 321,
                },
            },
        },
    },
};

beforeAll(async () => {
    db = await dbInit('applications_serial', getLogger, {});
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    sdkReporting: true,
                },
            },
        },
        db.rawDatabase,
    );

    defaultToken =
        await app.services.apiTokenService.createApiTokenWithProjects({
            type: ApiTokenType.CLIENT,
            projects: ['default'],
            environment: 'default',
            tokenName: 'tester',
        });
});

afterEach(async () => {
    await Promise.all([
        db.stores.clientMetricsStoreV2.deleteAll(),
        db.stores.clientInstanceStore.deleteAll(),
        db.stores.featureToggleStore.deleteAll(),
    ]);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should show correct number of total', async () => {
    await Promise.all([
        app.createFeature('toggle-name-1'),
        app.createFeature('toggle-name-2'),
        app.createFeature('toggle-name-3'),
        app.request.post('/api/client/register').send({
            appName: metrics.appName,
            instanceId: metrics.instanceId,
            strategies: ['default'],
            sdkVersion: 'unleash-client-test',
            started: Date.now(),
            interval: 10,
        }),
        app.request.post('/api/client/register').send({
            appName: metrics.appName,
            instanceId: 'another-instance',
            strategies: ['default'],
            sdkVersion: 'unleash-client-test2',
            started: Date.now(),
            interval: 10,
        }),
    ]);
    await app.services.clientInstanceService.bulkAdd();
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metrics)
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();

    const { body } = await app.request
        .get(`/api/admin/metrics/applications/${metrics.appName}/overview`)
        .expect(200);

    const expected = {
        projects: ['default'],
        issues: {
            missingStrategies: [],
        },
        environments: [
            {
                instanceCount: 2,
                name: 'default',
                sdks: ['unleash-client-test', 'unleash-client-test2'],
            },
        ],
        featureCount: 3,
    };

    expect(body).toMatchObject(expected);

    const { body: instancesBody } = await app.request
        .get(
            `/api/admin/metrics/instances/${metrics.appName}/environment/default`,
        )
        .expect(200);

    expect(instancesBody).toMatchObject({
        instances: [
            { instanceId: 'instanceId', sdkVersion: 'unleash-client-test' },
            {
                instanceId: 'another-instance',
                sdkVersion: 'unleash-client-test2',
            },
        ],
    });
});

test('should show missing features and strategies', async () => {
    await Promise.all([
        app.createFeature('toggle-name-1'),
        app.request.post('/api/client/register').send({
            appName: metrics.appName,
            instanceId: metrics.instanceId,
            strategies: ['my-special-strategy'],
            sdkVersion: 'unleash-client-node:1.0.0',
            started: Date.now(),
            interval: 10,
        }),
    ]);
    await app.services.clientInstanceService.bulkAdd();
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metrics)
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();

    const { body } = await app.request
        .get(`/api/admin/metrics/applications/${metrics.appName}/overview`)
        .expect(200);

    const expected = {
        projects: ['default'],
        environments: [
            {
                instanceCount: 1,
                name: 'default',
                sdks: ['unleash-client-node:1.0.0'],
                issues: {
                    missingFeatures: ['toggle-name-2', 'toggle-name-3'],
                    outdatedSdks: ['unleash-client-node:1.0.0'],
                },
            },
        ],
        issues: {
            missingStrategies: ['my-special-strategy'],
        },
        featureCount: 3,
    };

    expect(body).toMatchObject(expected);
});
