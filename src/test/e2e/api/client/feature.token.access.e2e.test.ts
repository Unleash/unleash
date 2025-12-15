import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import type { ApiTokenService } from '../../../../lib/services/api-token-service.js';
import { ApiTokenType } from '../../../../lib/types/model.js';
import { DEFAULT_ENV } from '../../../../lib/util/constants.js';
import { TEST_AUDIT_USER } from '../../../../lib/types/index.js';

let app: IUnleashTest;
let db: ITestDb;

let apiTokenService: ApiTokenService;

const environment = 'testing';
const project = 'default';
const project2 = 'some';
const tokenName = 'test';
const _tokenUserId = -9999;
const feature1 = 'f1.token.access';
const feature2 = 'f2.token.access';
const feature3 = 'f3.p2.token.access';

beforeAll(async () => {
    db = await dbInit('feature_api_api_access_client', getLogger);
    app = await setupAppWithAuth(db.stores, {}, db.rawDatabase);
    apiTokenService = app.services.apiTokenService;

    const { featureToggleService, environmentService } = app.services;
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

    await featureToggleService.createFeatureToggle(
        project,
        {
            name: feature1,
            description: 'the #1 feature',
        },
        TEST_AUDIT_USER,
    );

    await featureToggleService.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        { projectId: project, featureName: feature1, environment: DEFAULT_ENV },
        TEST_AUDIT_USER,
    );
    await featureToggleService.createStrategy(
        {
            name: 'flexibleRollout',
            constraints: [],
            parameters: {},
        },
        { projectId: project, featureName: feature1, environment },
        TEST_AUDIT_USER,
    );

    // create feature 2
    await featureToggleService.createFeatureToggle(
        project,
        {
            name: feature2,
        },
        TEST_AUDIT_USER,
    );
    await featureToggleService.createStrategy(
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
        { projectId: project, featureName: feature2, environment },
        TEST_AUDIT_USER,
    );

    // create feature 3
    await featureToggleService.createFeatureToggle(
        project2,
        {
            name: feature3,
        },
        TEST_AUDIT_USER,
    );
    await featureToggleService.createStrategy(
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

test('returns feature flag with "default" config', async () => {
    const token = await apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.BACKEND,
        tokenName,
        environment: DEFAULT_ENV,
        projects: [project],
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

test('returns feature flag with testing environment config', async () => {
    const token = await apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.BACKEND,
        tokenName: tokenName,
        environment,
        projects: [project],
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
            expect(f1.strategies[0].name).toBe('flexibleRollout');
            expect(f2.strategies).toHaveLength(1);
            expect(query.project[0]).toBe(project);
            expect(query.environment).toBe(environment);
        });
});

test('returns feature flag for project2', async () => {
    const token = await apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.BACKEND,
        tokenName: tokenName,
        environment,
        projects: [project2],
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

test('returns feature flag for all projects', async () => {
    const token = await apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.BACKEND,
        tokenName: tokenName,
        environment,
        projects: ['*'],
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
