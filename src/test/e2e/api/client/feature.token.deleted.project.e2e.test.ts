import { type IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import type { ApiTokenService } from '../../../../lib/services/api-token-service';
import { ApiTokenType } from '../../../../lib/types/models/api-token';
import { DEFAULT_ENV } from '../../../../lib/util/constants';
import { TEST_AUDIT_USER } from '../../../../lib/types';
import { User } from '../../../../lib/server-impl';

let app: IUnleashTest;
let db: ITestDb;

let apiTokenService: ApiTokenService;

const environment = 'testing';
const project = 'default';
const project2 = 'some';
const deletionProject = 'deletion';
const deletionTokenName = 'delete';
const feature1 = 'f1.token.access';
const feature2 = 'f2.token.access';
const feature3 = 'f3.p2.token.access';

beforeAll(async () => {
    db = await dbInit('feature_api_api_access_client_deletion', getLogger);
    app = await setupAppWithAuth(db.stores, {}, db.rawDatabase);
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
        mode: 'open' as const,
    });

    await projectStore.create({
        id: deletionProject,
        name: 'Deletion Project',
        description: '',
        mode: 'open' as const,
    });

    await environmentService.addEnvironmentToProject(
        environment,
        project,
        TEST_AUDIT_USER,
    );
    await environmentService.addEnvironmentToProject(
        environment,
        project2,
        TEST_AUDIT_USER,
    );

    await featureToggleServiceV2.createFeatureToggle(
        project,
        {
            name: feature1,
            description: 'the #1 feature',
        },
        TEST_AUDIT_USER,
    );

    await featureToggleServiceV2.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        { projectId: project, featureName: feature1, environment: DEFAULT_ENV },
        TEST_AUDIT_USER,
    );
    await featureToggleServiceV2.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        { projectId: project, featureName: feature1, environment },
        TEST_AUDIT_USER,
    );

    // create feature 2
    await featureToggleServiceV2.createFeatureToggle(
        project,
        {
            name: feature2,
        },
        TEST_AUDIT_USER,
    );
    await featureToggleServiceV2.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        { projectId: project, featureName: feature2, environment },
        TEST_AUDIT_USER,
    );

    // create feature 3
    await featureToggleServiceV2.createFeatureToggle(
        project2,
        {
            name: feature3,
        },
        TEST_AUDIT_USER,
    );
    await featureToggleServiceV2.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        { projectId: project2, featureName: feature3, environment },
        TEST_AUDIT_USER,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('doesnt return feature flags if project deleted', async () => {
    const token = await apiTokenService.createApiToken({
        type: ApiTokenType.CLIENT,
        tokenName: deletionTokenName,
        environment,
        project: deletionProject,
    });

    await app.services.projectService.deleteProject(
        deletionProject,
        new User(TEST_AUDIT_USER),
        TEST_AUDIT_USER,
    );

    await app.services.apiTokenService.fetchActiveTokens();

    await app.request
        .get('/api/client/features')
        .set('Authorization', token.secret)
        .expect('Content-Type', /json/)
        .expect(401);
});
