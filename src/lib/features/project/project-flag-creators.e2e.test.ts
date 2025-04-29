import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_flag_creators', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.userStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should return flag creators', async () => {
    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user1@getunleash.io',
        })
        .expect(200);
    await app.createFeature('flag-name-1');
    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user2@getunleash.io',
        })
        .expect(200);
    await app.createFeature('flag-name-2');
    await app.archiveFeature('flag-name-2');

    const { body } = await app.request
        .get('/api/admin/projects/default/flag-creators')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toEqual([{ id: 1, name: 'user1@getunleash.io' }]);
});
