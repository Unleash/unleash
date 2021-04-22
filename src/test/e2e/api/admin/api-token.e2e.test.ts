import { setupApp, setupAppWithCustomAuth } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { ApiTokenType, IApiToken } from '../../../../lib/db/api-token-store';
import { RoleName } from '../../../../lib/services/access-service';

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('token_api_serial', getLogger);
    stores = db.stores;
});

test(async () => {
    await db.destroy();
});

test(async () => {
    const tokens = await stores.apiTokenStore.getAll();
    const deleteAll = tokens.map((t: IApiToken) =>
        stores.apiTokenStore.delete(t.secret),
    );
    await Promise.all(deleteAll);
});

test('returns empty list of tokens', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tokens.length).toBe(0);
        });
});

test('creates new client token', async () => {
    expect.assertions(4);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.username).toBe('default-client');
            expect(res.body.type).toBe('client');
            expect(res.body.createdAt).toBeTruthy();
            expect(res.body.secret.length > 16).toBe(true);
        });
});

test('creates new admin token', async () => {
    expect.assertions(5);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.username).toBe('default-admin');
            expect(res.body.type).toBe('admin');
            expect(res.body.createdAt).toBeTruthy();
            expect(res.body.expiresAt).toBeFalsy();
            expect(res.body.secret.length > 16).toBe(true);
        });
});

test('creates new admin token with expiry', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    const expiresAt = new Date();
    const expiresAtAsISOStr = JSON.parse(JSON.stringify(expiresAt));
    return request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
            expiresAt,
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.expiresAt).toBe(expiresAtAsISOStr);
        });
});

test('update admin token with expiry', async () => {
    expect.assertions(2);
    const request = await setupApp(stores);

    const tokenSecret = 'random-secret-update';

    await stores.apiTokenStore.insert({
        username: 'test',
        secret: tokenSecret,
        type: ApiTokenType.CLIENT,
    });

    await request
        .put(`/api/admin/api-tokens/${tokenSecret}`)
        .send({
            expiresAt: new Date(),
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    return request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tokens.length).toBe(1);
            expect(res.body.tokens[0].expiresAt).toBeTruthy();
        });
});

test('creates a lot of client tokens', async () => {
    expect.assertions(4);
    const request = await setupApp(stores);

    const requests = [];

    for (let i = 0; i < 10; i++) {
        requests.push(
            request
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
    return request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tokens.length).toBe(10);
            expect(res.body.tokens[2].type).toBe('client');
        });
});

test('removes api token', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);

    const tokenSecret = 'random-secret';

    await stores.apiTokenStore.insert({
        username: 'test',
        secret: tokenSecret,
        type: ApiTokenType.CLIENT,
    });

    await request
        .delete(`/api/admin/api-tokens/${tokenSecret}`)
        .set('Content-Type', 'application/json')
        .expect(200);

    return request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tokens.length).toBe(0);
        });
});

test('none-admins should only get client tokens', async () => {
    expect.assertions(2);

    const email = 'custom-user@mail.com';

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.EDITOR);
            const user = await userService.createUser({
                email,
                rootRole: role.id,
            });
            req.user = user;
            next();
        });
    };

    const request = await setupAppWithCustomAuth(stores, preHook);

    await stores.apiTokenStore.insert({
        username: 'test',
        secret: '1234',
        type: ApiTokenType.CLIENT,
    });

    await stores.apiTokenStore.insert({
        username: 'test',
        secret: 'sdfsdf2d',
        type: ApiTokenType.ADMIN,
    });

    return request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tokens.length).toBe(1);
            expect(res.body.tokens[0].type).toBe(ApiTokenType.CLIENT);
        });
});

test('Only token-admins should be allowed to create token', async () => {
    expect.assertions(0);

    const email = 'custom-user2@mail.com';

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.EDITOR);
            req.user = await userService.createUser({
                email,
                rootRole: role.id,
            });
            next();
        });
    };

    const request = await setupAppWithCustomAuth(stores, preHook);

    return request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
        })
        .set('Content-Type', 'application/json')
        .expect(403);
});

test('Token-admin should be allowed to create token', async () => {
    expect.assertions(0);
    const email = 'custom-user3@mail.com';

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.ADMIN);
            req.user = await userService.createUser({
                email,
                rootRole: role.id,
            });
            next();
        });
    };

    const request = await setupAppWithCustomAuth(stores, preHook);

    return request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});
