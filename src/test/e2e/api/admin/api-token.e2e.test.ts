import test from 'ava';
import { setupApp, setupAppWithCustomAuth } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { ApiTokenType, IApiToken } from '../../../../lib/db/api-token-store';
import User from '../../../../lib/user';
import { CREATE_API_TOKEN, CREATE_FEATURE } from '../../../../lib/permissions';
import { RoleName } from '../../../../lib/services/access-service';

let stores;
let db;

test.before(async () => {
    db = await dbInit('token_api_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await db.destroy();
});

test.afterEach.always(async () => {
    const tokens = await stores.apiTokenStore.getAll();
    const deleteAll = tokens.map((t: IApiToken) =>
        stores.apiTokenStore.delete(t.secret),
    );
    await Promise.all(deleteAll);
});

test.serial('returns empty list of tokens', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.tokens.length, 0);
        });
});

test.serial('creates new client token', async t => {
    t.plan(4);
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
            t.is(res.body.username, 'default-client');
            t.is(res.body.type, 'client');
            t.truthy(res.body.createdAt);
            t.true(res.body.secret.length > 16);
        });
});

test.serial('creates new admin token', async t => {
    t.plan(5);
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
            t.is(res.body.username, 'default-admin');
            t.is(res.body.type, 'admin');
            t.truthy(res.body.createdAt);
            t.falsy(res.body.expiresAt);
            t.true(res.body.secret.length > 16);
        });
});

test.serial('creates new admin token with expiry', async t => {
    t.plan(1);
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
            t.is(res.body.expiresAt, expiresAtAsISOStr);
        });
});

test.serial('update admin token with expiry', async t => {
    t.plan(2);
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
            t.is(res.body.tokens.length, 1);
            t.truthy(res.body.tokens[0].expiresAt);
        });
});

test.serial('creates a lot of client tokens', async t => {
    t.plan(4);
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
    t.plan(2);
    return request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.tokens.length, 10);
            t.is(res.body.tokens[2].type, 'client');
        });
});

test.serial('removes api token', async t => {
    t.plan(1);
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
            t.is(res.body.tokens.length, 0);
        });
});

test.serial('none-admins should only get client tokens', async t => {
    t.plan(2);

    const email = 'custom-user@mail.com';

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.REGULAR);
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
            t.is(res.body.tokens.length, 1);
            t.is(res.body.tokens[0].type, ApiTokenType.CLIENT);
        });
});

test.serial('Only token-admins should be allowed to create token', async t => {
    t.plan(0);

    const email = 'custom-user2@mail.com';

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.REGULAR);
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

test.serial('Token-admin should be allowed to create token', async t => {
    t.plan(0);
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
