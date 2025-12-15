import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../../helpers/database-init.js';
import getLogger from '../../../../fixtures/no-logger.js';
import type { IPatStore } from '../../../../../lib/types/stores/pat-store.js';

let app: IUnleashTest;
let db: ITestDb;
let patStore: IPatStore;

const tomorrow = new Date();
let firstSecret: string;
let firstId: string;
tomorrow.setDate(tomorrow.getDate() + 1);

beforeAll(async () => {
    getLogger.setMuteError(true);
    db = await dbInit('user_pat', getLogger);
    patStore = db.stores.patStore;
    app = await setupAppWithAuth(db.stores, {}, db.rawDatabase);

    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user@getunleash.io',
        })
        .expect(200);
});

afterAll(async () => {
    getLogger.setMuteError(false);
    await app.destroy();
    await db.destroy();
});

test('should create a PAT', async () => {
    const description = 'expected description';
    const { request } = app;

    const { body } = await request
        .post('/api/admin/user/tokens')
        .send({
            expiresAt: tomorrow,
            description: description,
        })
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
        })
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
        })
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

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await request
        .post('/api/admin/user/tokens')
        .send({
            description: 'my expired pat',
            expiresAt: yesterday,
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should fail creation of PAT without a description', async () => {
    await app.request
        .post('/api/admin/user/tokens')
        .send({
            expiresAt: tomorrow,
        })
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
        })
        .set('Content-Type', 'application/json')
        .expect(201);

    await app.request
        .post('/api/admin/user/tokens')
        .send({
            description,
            expiresAt: tomorrow,
        })
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
        })
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
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should get user id 1', async () => {
    await app.request.post('/logout').expect(302);
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
    const secret = 'user:expired-token';

    await patStore.create(
        {
            id: 1,
            description: 'expired-token',
            expiresAt: '2020-01-01',
        },
        secret,
        1,
    );

    await app.request
        .get('/api/admin/user')
        .set('Authorization', secret)
        .expect(401);
});
/** TODO: Make this run properly
test('should fail creation of PAT when PAT limit has been reached', async () => {
    const setup = await setupAppWithoutSupertest(db.stores);
    const address = setup.server.address();
    expect(address).not.toBeNull();
    expect(address).toHaveProperty('port');
    // @ts-expect-error We just checked that we do indeed have the port
    const baseUrl = `http://localhost:${address.port}`;

    const tokenCreations: Promise<any>[] = [];
    const tokenUrl = `${baseUrl}/api/admin/user/tokens`;
    for (let i = 0; i < PAT_LIMIT; i++) {
        tokenCreations.push(
            fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: `my pat ${i}`,
                    expiresAt: tomorrow,
                }),
                credentials: 'include',
            }).catch((rej) => {
                console.log('Rejected');
            }),
        );
    }
    await Promise.all(tokenCreations);
    expect(tokenCreations).toHaveLength(PAT_LIMIT);
    const denied = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            description: `my pat ${PAT_LIMIT}`,
            expiresAt: tomorrow,
        }),
    });
    expect(denied.status).toBe(403);
    await setup.destroy();
});
*/
