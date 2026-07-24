import {
    ApiTokenType,
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
} from '../../../../lib/types/index.js';
import getLogger from '../../../fixtures/no-logger.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('token_api_v2_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
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

test('lists, updates, and deletes tokens across both token stores', async () => {
    const legacySecret = 'default:development.legacy-token';
    await db.stores.apiTokenStore.insert(
        {
            projects: ['default'],
            tokenName: 'legacy-token',
            secret: legacySecret,
            type: ApiTokenType.BACKEND,
            environment: 'development',
        },
        SYSTEM_USER_ID,
    );
    await app.services.apiTokenV2Service.create(
        {
            projects: ['default'],
            tokenName: 'secure-token',
            type: ApiTokenType.BACKEND,
            environment: 'development',
            userCreated: true,
        },
        SYSTEM_USER_AUDIT,
    );

    const listResponse = await app.request
        .get('/api/admin/api-tokens')
        .expect(200);

    expect(listResponse.body.tokens).toHaveLength(2);
    const secureToken = listResponse.body.tokens.find(
        (token) => token.tokenName === 'secure-token',
    );
    expect(secureToken.tokenName).toEqual('secure-token');

    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    await app.request
        .put(`/api/admin/api-tokens/${legacySecret}`)
        .send({ expiresAt })
        .expect(200);
    await app.request
        .put(`/api/admin/api-tokens/${secureToken.secret}`)
        .send({ expiresAt })
        .expect(200);

    const updatedResponse = await app.request
        .get('/api/admin/api-tokens')
        .expect(200);
    expect(updatedResponse.body.tokens).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                tokenName: 'legacy-token',
                expiresAt,
                secure: false,
            }),
            expect.objectContaining({
                tokenName: 'secure-token',
                expiresAt,
                secure: true,
            }),
        ]),
    );

    await app.request
        .delete(`/api/admin/api-tokens/${secureToken.secret}`)
        .expect(200);
    await app.request
        .delete(`/api/admin/api-tokens/${legacySecret}`)
        .expect(200);

    const emptyResponse = await app.request
        .get('/api/admin/api-tokens')
        .expect(200);
    expect(emptyResponse.body.tokens).toEqual([]);
});
