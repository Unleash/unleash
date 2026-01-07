import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { ALL } from '../../../../lib/types/models/api-token.js';
import { ApiTokenType } from '../../../../lib/types/model.js';
import { DEFAULT_ENV } from '../../../../lib/util/index.js';
import { addDays } from 'date-fns';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('token_api_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
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

test.each(['client', 'backend'])('creates new %s token', async (type) => {
    await app.request
        .post('/api/admin/api-tokens')
        .send({
            tokenName: 'default-client',
            type,
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.tokenName).toBe('default-client');
            expect(res.body.type).toBe(type);
            expect(res.body.createdAt).toBeTruthy();
            expect(res.body.secret.length > 16).toBe(true);
        });
});

test('update client token with expiry', async () => {
    const tokenSecret = '*:environment.random-secret-update';

    await db.stores.apiTokenStore.insert({
        projects: ['*'],
        tokenName: 'test_token',
        secret: tokenSecret,
        type: ApiTokenType.BACKEND,
        environment: 'development',
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

test.each([
    'client',
    'backend',
])('creates a lot of backend tokens from type %s', async (type) => {
    const requests: any[] = [];

    for (let i = 0; i < 10; i++) {
        requests.push(
            app.request
                .post('/api/admin/api-tokens')
                .send({
                    tokenName: 'default-client',
                    type,
                })
                .set('Content-Type', 'application/json')
                .expect(201),
        );
    }
    await Promise.all(requests);
    expect.assertions(4);
    await app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(10);
            expect(res.body.tokens[2].type).toBe(ApiTokenType.CLIENT);
        });
    await app.request
        .get('/api/admin/api-tokens/default-client')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(10);
            expect(res.body.tokens[2].type).toBe(ApiTokenType.CLIENT);
        });
});

test('removes api token', async () => {
    const tokenSecret = '*:environment.random-secret';

    await db.stores.apiTokenStore.insert({
        environment: 'development',
        projects: ['*'],
        tokenName: 'testtoken',
        secret: tokenSecret,
        type: ApiTokenType.BACKEND,
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

test.each([
    'client',
    'backend',
])('creates new %s token: project & environment defaults to "*"', async (type) => {
    await app.request
        .post('/api/admin/api-tokens')
        .send({
            tokenName: 'default-client',
            type,
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.type).toBe(type);
            expect(res.body.secret.length > 16).toBe(true);
            expect(res.body.environment).toBe(DEFAULT_ENV);
            expect(res.body.projects[0]).toBe(ALL);
        });
});

test.each([
    'client',
    'backend',
])('creates new %s token with project & environment set', async (type) => {
    await app.request
        .post('/api/admin/api-tokens')
        .send({
            tokenName: 'default-client',
            type,
            projects: ['default'],
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.type).toBe(type);
            expect(res.body.secret.length > 16).toBe(true);
            expect(res.body.environment).toBe(DEFAULT_ENV);
            expect(res.body.projects[0]).toBe('default');
        });
});

test('should prefix default token with "*:*."', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            tokenName: 'default-client',
            type: 'client',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.secret).toMatch(
                new RegExp(`\\*:${DEFAULT_ENV}\\..*`),
            );
        });
});

test('should prefix token with "project:environment."', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            tokenName: 'default-client',
            type: 'client',
            projects: ['default'],
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.secret).toMatch(
                new RegExp(`default:${DEFAULT_ENV}\\..*`),
            );
        });
});

test('should not create token for invalid projectId', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            tokenName: 'default-client',
            type: 'client',
            projects: ['bogus-project-something'],
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
            tokenName: 'default-client',
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

test('needs tokenName properties set', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            type: 'client',
            environment: '*',
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('can not create token with admin type', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            tokenName: 'default-token-name',
            type: 'admin',
            environment: '*',
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('client tokens cannot span all environments', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            tokenName: 'default-client',
            type: 'client',
            environment: ALL,
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should create token for disabled environment', async () => {
    await db.stores.environmentStore.create({
        name: 'disabledEnvironment',
        type: 'production',
        enabled: false,
    });
    return app.request
        .post('/api/admin/api-tokens')
        .send({
            tokenName: 'default',
            type: 'client',
            projects: ['default'],
            environment: 'disabledEnvironment',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('updating expiry of non existing token should yield 200', async () => {
    return app.request
        .put('/api/admin/api-tokens/randomnonexistingsecret')
        .send({ expiresAt: addDays(new Date(), 14) })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('Deleting non-existing token should yield 200', async () => {
    return app.request
        .delete('/api/admin/api-tokens/random-non-existing-token')
        .expect(200);
});

test('having an existing client token in the db of type client still works', async () => {
    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'default-client',
        type: ApiTokenType.CLIENT,
        environment: DEFAULT_ENV,
        projects: ['*'],
    });

    const { body } = await app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200);

    const { tokens } = body;
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toMatchObject({
        tokenName: 'default-client',
        type: ApiTokenType.CLIENT,
        environment: DEFAULT_ENV,
        projects: ['*'],
    });
});
