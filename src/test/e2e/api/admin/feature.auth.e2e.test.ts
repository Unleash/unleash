import { setupAppWithAuth } from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_api_auth', getLogger);
});

afterAll(async () => {
    await db.destroy();
});

test('creates new feature flag with createdBy', async () => {
    expect.assertions(1);

    const { request, destroy } = await setupAppWithAuth(
        db.stores,
        {},
        db.rawDatabase,
    );

    // Login
    await request.post('/auth/demo/login').send({
        email: 'user@mail.com',
    });

    // create flag
    await request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'com.test.Username',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .expect(201);

    await request.get('/api/admin/events/com.test.Username').expect((res) => {
        expect(res.body.events[0].createdBy).toBe('user@mail.com');
    });

    await destroy();
});

test('should require authenticated user', async () => {
    expect.assertions(0);
    const { request, destroy } = await setupAppWithAuth(db.stores);
    await request.get('/api/admin/projects/default/features').expect(401);
    await destroy();
});
