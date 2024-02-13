import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';

import { ApiTokenType, IApiToken } from '../../types/models/api-token';

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

afterEach(async () => {});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should return empty list of applications', async () => {
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

    expect(body).toMatchObject([
        {
            environments: ['default'],
            instances: ['instanceId'],
            name: 'appName',
            sdks: [
                {
                    name: 'unleash-client-test',
                    versions: ['1.2'],
                },
            ],
        },
    ]);
});
