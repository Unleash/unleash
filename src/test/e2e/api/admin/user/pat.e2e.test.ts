import { IUnleashTest, setupAppWithAuth } from '../../../helpers/test-helper';
import dbInit, { ITestDb } from '../../../helpers/database-init';
import getLogger from '../../../../fixtures/no-logger';
import { IPat } from '../../../../../lib/types/models/pat';

let app: IUnleashTest;
let db: ITestDb;

let tomorrow = new Date();
let firstSecret;
tomorrow.setDate(tomorrow.getDate() + 1);

beforeAll(async () => {
    db = await dbInit('user_pat', getLogger);
    app = await setupAppWithAuth(db.stores);

    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user@getunleash.io',
        })
        .expect(200);
});

afterAll(async () => {
    await app.destroy();
});

test('should create a PAT', async () => {
    const description = 'expected description';
    const { request } = app;

    const { body } = await request
        .post('/api/admin/user/tokens')
        .send({
            expiresAt: tomorrow,
            description: description,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(201);

    expect(new Date(body.expiresAt)).toEqual(tomorrow);
    expect(body.description).toEqual(description);
    firstSecret = body.secret;

    const response = await request
        .get('/api/admin/user/tokens')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(response.body.pats).toHaveLength(1);
});

test('should delete the PAT', async () => {
    const { request } = app;

    const { body } = await request
        .post('/api/admin/user/tokens')
        .send({
            expiresAt: tomorrow,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(201);

    const createdSecret = body.secret;

    await request.delete(`/api/admin/user/tokens/${createdSecret}`).expect(200);
});

test('should get all PATs', async () => {
    const { request } = app;

    const { body } = await request
        .get('/api/admin/user/tokens')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.pats).toHaveLength(1);
});

test('should get only current user PATs', async () => {
    const { request } = app;

    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user-second@getunleash.io',
        })
        .expect(200);

    await request
        .post('/api/admin/user/tokens')
        .send({
            expiresAt: tomorrow,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(201);

    const { body } = await request
        .get('/api/admin/user/tokens')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.pats).toHaveLength(1);
});

test('should fail creation of PAT with passed expiry', async () => {
    const { request } = app;

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await request
        .post('/api/admin/user/tokens')
        .send({
            expiresAt: yesterday,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(500);
});

test('should get user id 1', async () => {
    await app.request.get('/logout').expect(302);
    await app.request
        .get('/api/admin/user')
        .set('Authorization', firstSecret)
        .expect(200)
        .expect((res) => {
            expect(res.body.user.email).toBe('user@getunleash.io');
            expect(res.body.user.id).toBe(1);
        });
});

test('should not get user with invalid token', async () => {
    await app.request.get('/logout').expect(302);
    await app.request
        .get('/api/admin/user')
        .set('Authorization', 'randomtoken')
        .expect(401);
});
