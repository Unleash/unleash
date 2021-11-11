import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { DEFAULT_ENV } from '../../../../lib/util/constants';

let app: IUnleashTest;
let db: ITestDb;

const featureName = 'feature.default.1';
const username = 'test';
const projectId = 'default';

beforeAll(async () => {
    db = await dbInit('feature_env_api_client', getLogger);
    app = await setupApp(db.stores);

    await app.services.featureToggleServiceV2.createFeatureToggle(
        projectId,
        {
            name: featureName,
            description: 'the #1 feature',
        },
        username,
    );

    await app.services.featureToggleServiceV2.createStrategy(
        { name: 'default', constraints: [], parameters: {} },
        { projectId, featureName, environment: DEFAULT_ENV },
        username,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns feature toggle for default env', async () => {
    await app.services.featureToggleServiceV2.updateEnabled(
        'default',
        'feature.default.1',
        'default',
        true,
        'test',
    );
    await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
            expect(res.body.features[0].enabled).toBe(true);
            expect(res.body.features[0].strategies).toHaveLength(1);
        });
});

test('returns feature toggle for default env even if it is removed from project', async () => {
    await db.stores.featureEnvironmentStore.disconnectFeatures(
        'default',
        'default',
    );

    await db.stores.featureEnvironmentStore.disconnectProject(
        'default',
        'default',
    );

    await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
            expect(res.body.features[0].enabled).toBe(false);
            expect(res.body.features[0].strategies).toHaveLength(1);
        });
});
