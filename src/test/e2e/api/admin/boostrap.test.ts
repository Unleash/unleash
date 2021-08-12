import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { setupAppWithAuth } from '../../helpers/test-helper';

let app;
let db;

const email = 'user@getunleash.io';

beforeAll(async () => {
    db = await dbInit('user_api_serial', getLogger);
    app = await setupAppWithAuth(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Should get ui-bootstrap data', async () => {
    // login
    await app.request
        .post('/api/admin/login')
        .send({
            email,
        })
        .expect(200);

    // get user data
    await app.request
        .get('/api/admin/ui-bootstrap')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            const bootstrap = res.body;
            expect(bootstrap.context).toBeDefined();
            expect(bootstrap.featureTypes).toBeDefined();
            expect(bootstrap.uiConfig).toBeDefined();
            expect(bootstrap.user).toBeDefined();
            expect(bootstrap.context.length).toBeGreaterThan(0);
            expect(bootstrap.user.email).toBe(email);
        });
});
