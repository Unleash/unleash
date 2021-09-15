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
            name: 'f1.token.access',
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
        'f1.token.access',
    );

    await featureToggleServiceV2.createStrategy(
        {
            name: 'custom-testing',
            constraints: [],
            parameters: {},
        },
        project,
        'f1.token.access',
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
            expect(res.body.features).toHaveLength(1);
        });
});
