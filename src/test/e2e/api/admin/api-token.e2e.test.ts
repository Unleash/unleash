import { setupApp } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { ALL, ApiTokenType } from '../../../../lib/types/models/api-token';
import { DEFAULT_ENV } from '../../../../lib/util/constants';

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
    return app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(0);
        });
});

test('creates new client token', async () => {
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
            expect(res.body.environment).toBe(ALL);
            expect(res.body.createdAt).toBeTruthy();
            expect(res.body.expiresAt).toBeFalsy();
            expect(res.body.secret.length > 16).toBe(true);
        });
});

test('creates new ADMIN token should fix casing', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'ADMIN',
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

test('creates new client token: project & environment defaults to "*"', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.type).toBe('client');
            expect(res.body.secret.length > 16).toBe(true);
            expect(res.body.environment).toBe(DEFAULT_ENV);
            expect(res.body.projects[0]).toBe(ALL);
        });
});

test('creates new client token with project & environment set', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
            project: 'default',
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.type).toBe('client');
            expect(res.body.secret.length > 16).toBe(true);
            expect(res.body.environment).toBe(DEFAULT_ENV);
            expect(res.body.projects[0]).toBe('default');
        });
});

test('should prefix default token with "*:*."', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.secret).toMatch(/\*:default\..*/);
        });
});

test('should prefix token with "project:environment."', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
            project: 'default',
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.secret).toMatch(/default:default\..*/);
        });
});

test('should not create token for invalid projectId', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
            project: 'bogus-project-something',
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect((res) => {
            expect(res.body.details[0].message).toMatch(
                /bogus-project-something/,
            );
        });
});

test('should not create token for invalid environment', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
            environment: 'bogus-environment-something',
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect((res) => {
            expect(res.body.details[0].message).toMatch(
                /bogus-environment-something/,
            );
        });
});

test('should not create token for invalid project & environment', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
            project: 'bogus-project-something',
            environment: 'bogus-environment-something',
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('admin token only supports ALL projects', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
            project: 'default',
            environment: '*',
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('admin token only supports ALL environments', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
            project: '*',
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('client tokens cannot span all environments', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
            environment: ALL,
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should not create token for disabled environment', async () => {
    await db.stores.environmentStore.create({
        name: 'disabledEnvironment',
        type: 'production',
        enabled: false,
    });
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default',
            type: 'client',
            project: 'default',
            environment: 'disabledEnvironment',
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});
