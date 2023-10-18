import dbInit, { ITestDb } from '../../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    insertLastSeenAt,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    const config = {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                dependentFeatures: true,
                separateAdminClientApi: true,
                useLastSeenRefactor: true,
            },
        },
    };

    db = await dbInit(
        'feature_toggles_last_seen_at_refactor',
        getLogger,
        config,
    );
    app = await setupAppWithCustomConfig(db.stores, config, db.rawDatabase);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should return last seen at per env for /api/admin/features', async () => {
    await app.createFeature('lastSeenAtPerEnv');

    await insertLastSeenAt('lastSeenAtPerEnv', db.rawDatabase, 'default');

    const response = await app.request
        .get('/api/admin/features')
        .expect('Content-Type', /json/)
        .expect(200);

    const found = await response.body.features.find(
        (featureToggle) => featureToggle.name === 'lastSeenAtPerEnv',
    );

    expect(found.environments[0].lastSeenAt).toEqual(
        '2023-10-01T12:34:56.000Z',
    );
});
