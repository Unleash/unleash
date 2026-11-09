import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { DEFAULT_ENV } from '../../../../lib/util/constants.js';
import { type IUser, TEST_AUDIT_USER } from '../../../../lib/types/index.js';
import { FEATURE_ENVIRONMENT_DISABLED } from '../../../../lib/events/index.js';

let app: IUnleashTest;
let db: ITestDb;

const featureName = 'feature.default.1';
const userId = -9999;
const projectId = 'default';

beforeAll(async () => {
    db = await dbInit('feature_env_api_client', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    allowDeprecatedApiTokenMiddleware: true,
                },
            },
        },
        db.rawDatabase,
    );

    await app.services.featureToggleService.createFeatureToggle(
        projectId,
        {
            name: featureName,
            description: 'the #1 feature',
        },
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.createStrategy(
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
    await app.services.featureToggleService.updateEnabled(
        'default',
        'feature.default.1',
        DEFAULT_ENV,
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
    await app.services.featureToggleService.createFeatureToggle(
        projectId,
        { name: 'feature.default.disabled' },
        TEST_AUDIT_USER,
    );
    const { headers } = await app.request.get('/api/client/features');

    await app.request
        .delete(`/api/admin/projects/default/environments/${DEFAULT_ENV}`)
        .expect(200);
    await app.services.configurationRevisionService.updateMaxRevisionId();

    await app.request
        .get('/api/client/features')
        .set('if-none-match', headers.etag)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(2);
            const feature = res.body.features.find(
                (f) => f.name === featureName,
            );
            expect(feature.enabled).toBe(false);
            expect(feature.strategies).toHaveLength(1);
        });

    const { body } = await app.getRecordedEvents({
        type: `IS:${FEATURE_ENVIRONMENT_DISABLED}`,
    });
    // only the flag that was on gets an event, from the user who removed the environment
    expect(body.events).toMatchObject([{ featureName, createdBy: 'unknown' }]);
});
