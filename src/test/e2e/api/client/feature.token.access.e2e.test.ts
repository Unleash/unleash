import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { ApiTokenService } from '../../../../lib/services/api-token-service';
import { ApiTokenType } from '../../../../lib/types/models/api-token';
import { DEFAULT_ENV } from '../../../../lib/util/constants';

let app: IUnleashTest;
let db: ITestDb;

let apiTokenService: ApiTokenService;

const environment = 'testing';
const project = 'default';
const project2 = 'some';
const username = 'test';
const feature1 = 'f1.token.access';
const feature2 = 'f2.token.access';
const feature3 = 'f3.p2.token.access';

beforeAll(async () => {
    db = await dbInit('feature_api_api_access_client', getLogger);
    app = await setupAppWithAuth(db.stores);
    apiTokenService = app.services.apiTokenService;

    const { featureToggleServiceV2, environmentService } = app.services;
    const { environmentStore, projectStore } = db.stores;

    await environmentStore.create({
        name: environment,
        type: 'test',
    });

    await projectStore.create({
        id: project2,
        name: 'Test Project 2',
        description: '',
    });

    await environmentService.addEnvironmentToProject(environment, project);
    await environmentService.addEnvironmentToProject(environment, project2);

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
        { projectId: project, featureName: feature1, environment: DEFAULT_ENV },
        username,
    );
    await featureToggleServiceV2.createStrategy(
        {
            name: 'custom-testing',
            constraints: [],
            parameters: {},
        },
        { projectId: project, featureName: feature1, environment },
        username,
    );

    // create feature 2
    await featureToggleServiceV2.createFeatureToggle(
        project,
        {
            name: feature2,
        },
        username,
    );
    await featureToggleServiceV2.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        { projectId: project, featureName: feature2, environment },
        username,
    );

    // create feature 3
    await featureToggleServiceV2.createFeatureToggle(
        project2,
        {
            name: feature3,
        },
        username,
    );
    await featureToggleServiceV2.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        { projectId: project2, featureName: feature3, environment },
        username,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns feature toggle with "default" config', async () => {
    const token = await apiTokenService.createApiToken({
        type: ApiTokenType.CLIENT,
        username,
        environment: DEFAULT_ENV,
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

test('returns feature toggle with testing environment config', async () => {
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
            expect(f1.strategies).toHaveLength(1);
            expect(f1.strategies[0].name).toBe('custom-testing');
            expect(f2.strategies).toHaveLength(1);
            expect(query.project[0]).toBe(project);
            expect(query.environment).toBe(environment);
        });
});

test('returns feature toggle for project2', async () => {
    const token = await apiTokenService.createApiToken({
        type: ApiTokenType.CLIENT,
        username,
        environment,
        project: project2,
    });
    await app.request
        .get('/api/client/features')
        .set('Authorization', token.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            const { features } = res.body;
            const f3 = features.find((f) => f.name === feature3);
            expect(features).toHaveLength(1);
            expect(f3.strategies).toHaveLength(1);
        });
});

test('returns feature toggle for all projects', async () => {
    const token = await apiTokenService.createApiToken({
        type: ApiTokenType.CLIENT,
        username,
        environment,
        project: '*',
    });
    await app.request
        .get('/api/client/features')
        .set('Authorization', token.secret)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            const { features } = res.body;
            expect(features).toHaveLength(3);
        });
});
