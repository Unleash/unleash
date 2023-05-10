import dbInit from '../../../helpers/database-init';
import { setupAppWithCustomConfig } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';
import { ApiTokenStore } from '../../../../../lib/db/api-token-store';

let app;
let db;

let apiTokenStore: ApiTokenStore;

beforeAll(async () => {
    db = await dbInit('projects_api_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });
    apiTokenStore = db.stores.apiTokenStore;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Should always return token type in lowercase', async () => {
    await apiTokenStore.insert({
        environment: '*',
        alias: 'some-alias',
        secret: 'some-secret',
        type: 'FRONTEND' as any,
        projects: ['default'],
        tokenName: 'some-name',
    });

    const storedToken = await apiTokenStore.get('some-secret');
    expect(storedToken.type).toBe('frontend');

    const { body } = await app.request
        .get('/api/admin/projects/default/api-tokens')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(body.tokens).toHaveLength(1);
    expect(body.tokens[0].type).toBe('frontend');
});
