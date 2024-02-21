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
import { ApplicationOverviewSchema } from '../../../../lib/openapi/spec/application-overview-schema';

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
    await db.stores.clientMetricsStoreV2.deleteAll();
    await db.stores.clientInstanceStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should show correct number of total', async () => {
    await app.createFeature('toggle-name-1');
    await app.createFeature('toggle-name-2');

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
        sdkVersion: 'unleash-client-test2',
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
        .get(`/api/admin/metrics/applications/${metrics.appName}/overview`)
        .expect(200);

    const expected: ApplicationOverviewSchema = {
        projects: ['default'],
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
});
