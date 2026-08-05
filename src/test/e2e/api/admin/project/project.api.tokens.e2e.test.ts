import dbInit, { type ITestDb } from '../../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../helpers/test-helper.js';
import getLogger from '../../../../fixtures/no-logger.js';
import { ApiTokenType } from '../../../../../lib/types/model.js';
import { DEFAULT_ENV, SYSTEM_USER_ID } from '../../../../../lib/server-impl.js';

describe('when secure token storage is disabled', () => {
    let app: IUnleashTest;
    let db: ITestDb;

    beforeAll(async () => {
        db = await dbInit('project_api_tokens_serial', getLogger);
        app = await setupAppWithCustomConfig(
            db.stores,
            {
                experimental: {
                    flags: {
                        strictSchemaValidation: true,
                        secureTokenStorage: false,
                    },
                },
            },
            db.rawDatabase,
        );
    });

    afterEach(async () => {
        await db.stores.apiTokenStore.deleteAll();
    });

    afterAll(async () => {
        await app.destroy();
        await db.destroy();
    });

    test('Returns empty list of tokens', async () => {
        return app.request
            .get('/api/admin/projects/default/api-tokens')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
                expect(res.body.tokens.length).toBe(0);
            });
    });

    test('Returns list of tokens', async () => {
        const tokenSecret = 'random-secret';

        await db.stores.apiTokenStore.insert(
            {
                tokenName: 'test',
                secret: tokenSecret,
                type: ApiTokenType.BACKEND,
                environment: DEFAULT_ENV,
                projects: ['default'],
            },
            SYSTEM_USER_ID,
        );
        return app.request
            .get('/api/admin/projects/default/api-tokens')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
                expect(res.body.tokens.length).toBe(1);
                expect(res.body.tokens[0].secret).toBe(tokenSecret);
            });
    });

    test('Returns 404 when given non-existent projectId', async () => {
        return app.request
            .get('/api/admin/projects/wrong/api-tokens')
            .expect('Content-Type', /json/)
            .expect(404)
            .expect((res) => {
                expect(res.body.tokens).toBe(undefined);
            });
    });

    test('fails to create new client token when given wrong project', async () => {
        return app.request
            .post('/api/admin/projects/wrong/api-tokens')
            .send({
                tokenName: 'default-client',
                type: 'client',
                projects: ['wrong'],
                environment: DEFAULT_ENV,
            })
            .set('Content-Type', 'application/json')
            .expect(404);
    });

    test.each([
        'client',
        'frontend',
        'backend',
    ])('creates new %s token', async (type) => {
        const { body, status } = await app.request
            .post('/api/admin/projects/default/api-tokens')
            .send({
                tokenName: `default-${type}`,
                type,
                projects: ['default'],
                environment: DEFAULT_ENV,
            })
            .set('Content-Type', 'application/json');
        expect(status).toBe(201);
        expect(body.tokenName).toBe(`default-${type}`);
    });

    test('Deletes existing tokens', async () => {
        const tokenSecret = 'random-secret';

        await db.stores.apiTokenStore.insert(
            {
                tokenName: 'test',
                secret: tokenSecret,
                type: ApiTokenType.BACKEND,
                environment: DEFAULT_ENV,
                projects: ['default'],
            },
            SYSTEM_USER_ID,
        );

        return app.request
            .delete(`/api/admin/projects/default/api-tokens/${tokenSecret}`)
            .set('Content-Type', 'application/json')
            .expect(200);
    });

    test('Returns Not Found when deleting non-existing tokens', async () => {
        const tokenSecret = 'random-secret';

        return app.request
            .delete(`/api/admin/projects/default/api-tokens/${tokenSecret}`)
            .set('Content-Type', 'application/json')
            .expect(404);
    });

    test('Returns Bad Request when deleting tokens with more than one project', async () => {
        const tokenSecret = 'random-secret';

        await db.stores.projectStore.create({
            id: 'other',
            name: 'other',
            description: 'other',
            mode: 'open',
        });

        await db.stores.apiTokenStore.insert(
            {
                tokenName: 'test',
                secret: tokenSecret,
                type: ApiTokenType.BACKEND,
                environment: DEFAULT_ENV,
                projects: ['default', 'other'],
            },
            SYSTEM_USER_ID,
        );

        return app.request
            .delete(`/api/admin/projects/default/api-tokens/${tokenSecret}`)
            .set('Content-Type', 'application/json')
            .expect(400);
    });
});

describe('when secure token storage is enabled', () => {
    let app: IUnleashTest;
    let db: ITestDb;

    beforeAll(async () => {
        db = await dbInit('project_api_tokens_secure_serial', getLogger);
        app = await setupAppWithCustomConfig(
            db.stores,
            {
                experimental: {
                    flags: {
                        strictSchemaValidation: true,
                        secureTokenStorage: true,
                    },
                },
            },
            db.rawDatabase,
        );
    });

    afterAll(async () => {
        await app.destroy();
        await db.destroy();
    });

    test('creates, lists, and deletes secure project API tokens', async () => {
        const tokenName = 'secure-project-token';
        const { body, status } = await app.request
            .post('/api/admin/projects/default/api-tokens')
            .send({
                tokenName,
                type: 'backend',
                projects: ['ignored-by-project-route'],
                environment: DEFAULT_ENV,
            })
            .set('Content-Type', 'application/json');

        expect(status).toBe(201);
        expect(body.secret).toMatch(/^default:development\.v2_/);

        const listResponse = await app.request
            .get('/api/admin/projects/default/api-tokens')
            .expect(200);
        expect(listResponse.body.tokens).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    tokenName,
                    secret: expect.stringMatching(/^[A-Za-z0-9_-]{22}$/),
                    secure: true,
                }),
            ]),
        );

        await app.request
            .delete(`/api/admin/projects/default/api-tokens/${body.secret}`)
            .expect(200);

        const deletedListResponse = await app.request
            .get('/api/admin/projects/default/api-tokens')
            .expect(200);
        expect(deletedListResponse.body.tokens).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    tokenName,
                }),
            ]),
        );
    });
});
