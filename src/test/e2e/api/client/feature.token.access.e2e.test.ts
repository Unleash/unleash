import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { ApiTokenService } from '../../../../lib/services/api-token-service';
import { ApiTokenType } from '../../../../lib/types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;

let apiTokenService: ApiTokenService;

const environment = 'testing';
const project = 'default';
const username = 'test';
const feature1 = 'f1.token.access';
const feature2 = 'f2.token.access';

beforeAll(async () => {
    db = await dbInit('feature_api_api_access_client', getLogger);
    app = await setupAppWithAuth(db.stores);
    apiTokenService = app.services.apiTokenService;

    const { featureToggleServiceV2, environmentService } = app.services;
    const { environmentStore } = db.stores;

    await environmentStore.create({
        name: environment,
        displayName: '',
        type: 'test',
    });

    await environmentService.addEnvironmentToProject(environment, project);

    await featureToggleServiceV2.createFeatureToggle(
        project,
        {
            name: feature1,
            description: 'the #1 feature',
        },
        username,
    );

    await featureToggleServiceV2.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        project,
        feature1,
    );

    await featureToggleServiceV2.createStrategy(
        {
            name: 'custom-testing',
            constraints: [],
            parameters: {},
        },
        project,
        feature1,
        environment,
    );

    await featureToggleServiceV2.createFeatureToggle(
        project,
        {
            name: feature2,
            description: 'the #1 feature',
        },
        username,
    );

    await featureToggleServiceV2.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        project,
        feature2,
        environment,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns feature toggle with :global: config', async () => {
    const token = await apiTokenService.createApiToken({
        type: ApiTokenType.CLIENT,
        username,
        environment: ':global:',
        project,
    });
    await app.request
        .get('/api/client/features')
        .set('Authorization', token.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            const { features } = res.body;
            const f1 = features.find((f) => f.name === feature1);
            const f2 = features.find((f) => f.name === feature2);
            expect(features).toHaveLength(2);
            expect(f1.strategies).toHaveLength(1);
            expect(f2.strategies).toHaveLength(0);
        });
});

test('returns feature toggle with :global: config', async () => {
    const token = await apiTokenService.createApiToken({
        type: ApiTokenType.CLIENT,
        username,
        environment,
        project,
    });
    await app.request
        .get('/api/client/features')
        .set('Authorization', token.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            const { features, query } = res.body;
            const f1 = features.find((f) => f.name === feature1);
            const f2 = features.find((f) => f.name === feature2);

            expect(features).toHaveLength(2);
            expect(f1.strategies).toHaveLength(2);
            expect(f2.strategies).toHaveLength(1);
            expect(query.project[0]).toBe(project);
            expect(query.environment).toBe(environment);
        });
});
