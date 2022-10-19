import { IUnleashTest, setupAppWithAuth } from '../../../helpers/test-helper';
import dbInit, { ITestDb } from '../../../helpers/database-init';
import getLogger from '../../../../fixtures/no-logger';
import { IPat } from '../../../../../lib/types/models/pat';
import { IPatStore } from '../../../../../lib/types/stores/pat-store';

let app: IUnleashTest;
let db: ITestDb;
let patStore: IPatStore;

let tomorrow = new Date();
let firstSecret;
let firstId;
tomorrow.setDate(tomorrow.getDate() + 1);

beforeAll(async () => {
    db = await dbInit('user_pat', getLogger);
    patStore = db.stores.patStore;
    app = await setupAppWithAuth(db.stores, {
        experimental: { flags: { personalAccessTokens: true } },
    });

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
    firstId = body.id;

    const response = await request
        .get('/api/admin/user/tokens')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(response.body.pats).toHaveLength(1);
});

test('should delete the PAT', async () => {
    const description = 'pat to be deleted';
    const { request } = app;

    const { body } = await request
        .post('/api/admin/user/tokens')
        .send({
            description,
            expiresAt: tomorrow,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(201);

    const createdId = body.id;

    await request.delete(`/api/admin/user/tokens/${createdId}`).expect(200);
});

test('should get all PATs', async () => {
    const { request } = app;

    const { body } = await request
        .get('/api/admin/user/tokens')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.pats).toHaveLength(1);
    expect(body.pats[0].secret).toBeUndefined();
    expect(body.pats[0].id).toBeDefined();
});

test('should not allow deletion of other users PAT', async () => {
    const { request } = app;

    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user-second@getunleash.io',
        })
        .expect(200);

    await request.delete(`/api/admin/user/tokens/${firstId}`).expect(200);

    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user@getunleash.io',
        })
        .expect(200);

    const { body } = await request
        .get('/api/admin/user/tokens')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.pats).toHaveLength(1);
    expect(body.pats[0].secret).toBeUndefined();
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
            description: 'my pat',
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
            description: 'my expired pat',
            expiresAt: yesterday,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should fail creation of PAT without a description', async () => {
    await app.request
        .post('/api/admin/user/tokens')
        .send({
            expiresAt: tomorrow,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should fail creation of PAT with a description that already exists for the current user', async () => {
    const description = 'duplicate description';

    await app.request
        .post('/api/admin/user/tokens')
        .send({
            description,
            expiresAt: tomorrow,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(201);

    await app.request
        .post('/api/admin/user/tokens')
        .send({
            description,
            expiresAt: tomorrow,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('should not fail creation of PAT when a description already exists for another user PAT', async () => {
    const description = 'another duplicate description';

    await app.request
        .post('/api/admin/user/tokens')
        .send({
            description,
            expiresAt: tomorrow,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(201);

    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user-other@getunleash.io',
        })
        .expect(200);

    await app.request
        .post('/api/admin/user/tokens')
        .send({
            description,
            expiresAt: tomorrow,
        } as IPat)
        .set('Content-Type', 'application/json')
        .expect(201);
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

test('should be able to get projects', async () => {
    await app.request
        .get('/api/admin/projects')
        .set('Authorization', firstSecret)
        .expect(200);
});

test('should be able to create a toggle', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .set('Authorization', firstSecret)
        .send({
            name: 'test-toggle',
            type: 'release',
        })
        .expect(201);
});

test('should not get user with invalid token', async () => {
    await app.request
        .get('/api/admin/user')
        .set('Authorization', 'randomtoken')
        .expect(401);
});

test('should not get user with expired token', async () => {
    const token = await patStore.create({
        id: 1,
        secret: 'user:expired-token',
        description: 'expired-token',
        userId: 1,
        expiresAt: new Date('2020-01-01'),
    });

    await app.request
        .get('/api/admin/user')
        .set('Authorization', token.secret)
        .expect(401);
});
