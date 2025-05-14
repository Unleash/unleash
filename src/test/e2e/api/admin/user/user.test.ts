import dbInit, { type ITestDb } from '../../../helpers/database-init.js';
import getLogger from '../../../../fixtures/no-logger.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../helpers/test-helper.js';

let app: IUnleashTest;
let db: ITestDb;

const email = 'user@getunleash.io';

beforeAll(async () => {
    db = await dbInit('user_api_serial', getLogger);
    app = await setupAppWithAuth(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Should get my user data', async () => {
    // login
    await app.request
        .post('/auth/demo/login')
        .send({
            email,
        })
        .expect(200);

    // get user data
    await app.request
        .get('/api/admin/user')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.user.email).toBe(email);
            expect(res.body.permissions).toBeDefined();
        });
});
