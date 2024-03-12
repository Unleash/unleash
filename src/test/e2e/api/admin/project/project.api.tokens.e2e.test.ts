import dbInit, { type ITestDb } from '../../../helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';
import { ApiTokenType } from '../../../../../lib/types/models/api-token';

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

    await db.stores.apiTokenStore.insert({
        tokenName: 'test',
        secret: tokenSecret,
        type: ApiTokenType.CLIENT,
        environment: 'default',
        projects: ['default'],
    });
    return app.request
        .get('/api/admin/projects/default/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(1);
            expect(res.body.tokens[0].secret).toBe(tokenSecret);
        });
});

test('Returns 404 when given non-existant projectId', async () => {
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
            username: 'default-client',
            type: 'client',
            projects: ['wrong'],
            environment: 'default',
        })
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('creates new client token', async () => {
    return app.request
        .post('/api/admin/projects/default/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
            projects: ['default'],
            environment: 'default',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.username).toBe('default-client');
        });
});

test('Deletes existing tokens', async () => {
    const tokenSecret = 'random-secret';

    await db.stores.apiTokenStore.insert({
        tokenName: 'test',
        secret: tokenSecret,
        type: ApiTokenType.CLIENT,
        environment: 'default',
        projects: ['default'],
    });

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

    await db.stores.apiTokenStore.insert({
        tokenName: 'test',
        secret: tokenSecret,
        type: ApiTokenType.CLIENT,
        environment: 'default',
        projects: ['default', 'other'],
    });

    return app.request
        .delete(`/api/admin/projects/default/api-tokens/${tokenSecret}`)
        .set('Content-Type', 'application/json')
        .expect(400);
});
