import { setupApp } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { ApiTokenType } from '../../../../lib/types/stores/api-token-store';

let db;
let app;

beforeAll(async () => {
    db = await dbInit('token_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
    await app.destroy();
});

afterEach(async () => {
    await db.stores.apiTokenStore.deleteAll();
});

test('returns empty list of tokens', async () => {
    expect.assertions(1);
    return app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(0);
        });
});

test('creates new client token', async () => {
    expect.assertions(4);
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.username).toBe('default-client');
            expect(res.body.type).toBe('client');
            expect(res.body.createdAt).toBeTruthy();
            expect(res.body.secret.length > 16).toBe(true);
        });
});

test('creates new admin token', async () => {
    expect.assertions(5);
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.username).toBe('default-admin');
            expect(res.body.type).toBe('admin');
            expect(res.body.createdAt).toBeTruthy();
            expect(res.body.expiresAt).toBeFalsy();
            expect(res.body.secret.length > 16).toBe(true);
        });
});

test('creates new admin token with expiry', async () => {
    expect.assertions(1);
    const expiresAt = new Date();
    const expiresAtAsISOStr = JSON.parse(JSON.stringify(expiresAt));
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
            expiresAt,
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.expiresAt).toBe(expiresAtAsISOStr);
        });
});

test('update admin token with expiry', async () => {
    expect.assertions(2);

    const tokenSecret = 'random-secret-update';

    await db.stores.apiTokenStore.insert({
        username: 'test',
        secret: tokenSecret,
        type: ApiTokenType.CLIENT,
    });

    await app.request
        .put(`/api/admin/api-tokens/${tokenSecret}`)
        .send({
            expiresAt: new Date(),
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    return app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(1);
            expect(res.body.tokens[0].expiresAt).toBeTruthy();
        });
});

test('creates a lot of client tokens', async () => {
    expect.assertions(4);

    const requests = [];

    for (let i = 0; i < 10; i++) {
        requests.push(
            app.request
                .post('/api/admin/api-tokens')
                .send({
                    username: 'default-client',
                    type: 'client',
                })
                .set('Content-Type', 'application/json')
                .expect(201),
        );
    }
    await Promise.all(requests);
    expect.assertions(2);
    return app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(10);
            expect(res.body.tokens[2].type).toBe('client');
        });
});

test('removes api token', async () => {
    expect.assertions(1);

    const tokenSecret = 'random-secret';

    await db.stores.apiTokenStore.insert({
        username: 'test',
        secret: tokenSecret,
        type: ApiTokenType.CLIENT,
    });

    await app.request
        .delete(`/api/admin/api-tokens/${tokenSecret}`)
        .set('Content-Type', 'application/json')
        .expect(200);

    return app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(0);
        });
});
