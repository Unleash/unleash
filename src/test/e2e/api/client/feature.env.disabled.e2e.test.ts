import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { DEFAULT_ENV } from '../../../../lib/util/constants';
import { type IUser, TEST_AUDIT_USER } from '../../../../lib/types';

let app: IUnleashTest;
let db: ITestDb;

const featureName = 'feature.default.1';
const username = 'test';
const userId = -9999;
const projectId = 'default';

beforeAll(async () => {
    db = await dbInit('feature_env_api_client', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {}, db.rawDatabase);

    await app.services.featureToggleServiceV2.createFeatureToggle(
        projectId,
        {
            name: featureName,
            description: 'the #1 feature',
        },
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleServiceV2.createStrategy(
        { name: 'default', constraints: [], parameters: {} },
        { projectId, featureName, environment: DEFAULT_ENV },
        TEST_AUDIT_USER,
        { id: userId } as IUser,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns feature flag for default env', async () => {
    await app.services.featureToggleServiceV2.updateEnabled(
        'default',
        'feature.default.1',
        'default',
        true,
        TEST_AUDIT_USER,
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

test('returns feature flag for default env even if it is removed from project', async () => {
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
