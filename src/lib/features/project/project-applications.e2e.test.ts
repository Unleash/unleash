import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { DEFAULT_ENV } from '../../server-impl.js';

import { ApiTokenType, type IApiToken } from '../../types/model.js';

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
        },
    },
};

beforeAll(async () => {
    db = await dbInit('projects_applications_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
    defaultToken =
        await app.services.apiTokenService.createApiTokenWithProjects({
            type: ApiTokenType.CLIENT,
            projects: ['default'],
            environment: DEFAULT_ENV,
            tokenName: 'tester',
        });
});

afterEach(async () => {
    await db.stores.clientMetricsStoreV2.deleteAll();
    await db.stores.clientInstanceStore.deleteAll();
    await db.stores.clientApplicationsStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should return applications', async () => {
    await app.createFeature('toggle-name-1');

    await app.request.post('/api/client/register').send({
        appName: metrics.appName,
        instanceId: metrics.instanceId,
        strategies: ['default'],
        sdkVersion: 'unleash-client-test:1.2',
        started: Date.now(),
        interval: 10,
    });
    await app.services.clientInstanceService.bulkAdd();
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metrics)
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();

    const { body } = await app.request
        .get('/api/admin/projects/default/applications')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        applications: [
            {
                environments: [DEFAULT_ENV],
                instances: ['instanceId'],
                name: 'appName',
                sdks: [
                    {
                        name: 'unleash-client-test',
                        versions: ['1.2'],
                    },
                ],
            },
        ],
        total: 1,
    });
});

test('should return applications if sdk was not in database', async () => {
    await app.createFeature('toggle-name-1');

    await app.request.post('/api/client/register').send({
        appName: metrics.appName,
        instanceId: metrics.instanceId,
        strategies: ['default'],
        started: Date.now(),
        interval: 10,
    });
    await app.services.clientInstanceService.bulkAdd();
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metrics)
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();

    const { body } = await app.request
        .get('/api/admin/projects/default/applications')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        applications: [
            {
                environments: [DEFAULT_ENV],
                instances: ['instanceId'],
                name: 'appName',
                sdks: [],
            },
        ],
        total: 1,
    });
});

test('should return application without version if sdk has just name', async () => {
    await app.createFeature('toggle-name-1');

    await app.request.post('/api/client/register').send({
        appName: metrics.appName,
        instanceId: metrics.instanceId,
        strategies: ['default'],
        sdkVersion: 'unleash-client-test',
        started: Date.now(),
        interval: 10,
    });
    await app.services.clientInstanceService.bulkAdd();
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metrics)
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();

    const { body } = await app.request
        .get('/api/admin/projects/default/applications')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        applications: [
            {
                environments: [DEFAULT_ENV],
                instances: ['instanceId'],
                name: 'appName',
                sdks: [
                    {
                        name: 'unleash-client-test',
                        versions: [],
                    },
                ],
            },
        ],
        total: 1,
    });
});

test('should sort by appName descending', async () => {
    await app.createFeature('toggle-name-1');

    await app.request.post('/api/client/register').send({
        appName: metrics.appName,
        instanceId: metrics.instanceId,
        strategies: ['default'],
        sdkVersion: 'unleash-client-test',
        started: Date.now(),
        interval: 10,
    });
    const secondApp = 'second-app';
    await app.request.post('/api/client/register').send({
        appName: secondApp,
        instanceId: metrics.instanceId,
        strategies: ['default'],
        sdkVersion: 'unleash-client-test',
        started: Date.now(),
        interval: 10,
    });
    await app.services.clientInstanceService.bulkAdd();
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metrics)
        .expect(202);

    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send({
            ...metrics,
            appName: secondApp,
        })
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();

    const { body } = await app.request
        .get('/api/admin/projects/default/applications?sortOrder=desc')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        applications: [
            {
                environments: [DEFAULT_ENV],
                instances: ['instanceId'],
                name: 'second-app',
                sdks: [
                    {
                        name: 'unleash-client-test',
                        versions: [],
                    },
                ],
            },
            {
                environments: [DEFAULT_ENV],
                instances: ['instanceId'],
                name: 'appName',
                sdks: [
                    {
                        name: 'unleash-client-test',
                        versions: [],
                    },
                ],
            },
        ],
        total: 2,
    });
});

test('should filter by sdk', async () => {
    await app.createFeature('toggle-name-1');

    await app.request.post('/api/client/register').send({
        appName: metrics.appName,
        instanceId: metrics.instanceId,
        strategies: ['default'],
        sdkVersion: 'unleash-java-test',
        started: Date.now(),
        interval: 10,
    });
    const secondApp = 'second-app';
    await app.request.post('/api/client/register').send({
        appName: secondApp,
        instanceId: metrics.instanceId,
        strategies: ['default'],
        sdkVersion: 'unleash-client-test',
        started: Date.now(),
        interval: 10,
    });
    await app.services.clientInstanceService.bulkAdd();
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metrics)
        .expect(202);

    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send({
            ...metrics,
            appName: secondApp,
        })
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();

    const { body } = await app.request
        .get('/api/admin/projects/default/applications?&query=java')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        applications: [
            {
                environments: [DEFAULT_ENV],
                instances: ['instanceId'],
                name: 'appName',
                sdks: [
                    {
                        name: 'unleash-java-test',
                        versions: [],
                    },
                ],
            },
        ],
        total: 1,
    });
});

test('should show correct number of total', async () => {
    await app.createFeature('toggle-name-1');

    await app.request.post('/api/client/register').send({
        appName: metrics.appName,
        instanceId: metrics.instanceId,
        strategies: ['default'],
        sdkVersion: 'unleash-client-test',
        started: Date.now(),
        interval: 10,
    });
    await app.request.post('/api/client/register').send({
        appName: metrics.appName,
        instanceId: 'another-instance',
        strategies: ['default'],
        sdkVersion: 'unleash-client-test',
        started: Date.now(),
        interval: 10,
    });
    const secondApp = 'second-app';
    await app.request.post('/api/client/register').send({
        appName: secondApp,
        instanceId: metrics.instanceId,
        strategies: ['default'],
        sdkVersion: 'unleash-client-test',
        started: Date.now(),
        interval: 10,
    });
    await app.services.clientInstanceService.bulkAdd();
    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metrics)
        .expect(202);

    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send({
            ...metrics,
            appName: secondApp,
        })
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();

    const { body } = await app.request
        .get('/api/admin/projects/default/applications?sortOrder=desc&limit=1')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        applications: [
            {
                environments: [DEFAULT_ENV],
                instances: ['instanceId'],
                name: 'second-app',
                sdks: [
                    {
                        name: 'unleash-client-test',
                        versions: [],
                    },
                ],
            },
        ],
        total: 2,
    });
});

test('should not show if metrics exist, but application does not', async () => {
    await app.createFeature('toggle-name-1');

    await app.request
        .post('/api/client/metrics')
        .set('Authorization', defaultToken.secret)
        .send(metrics)
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();

    const { body } = await app.request
        .get('/api/admin/projects/default/applications?sortOrder=desc&limit=1')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        applications: [],
        total: 0,
    });
});
