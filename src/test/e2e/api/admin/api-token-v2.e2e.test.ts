import {
    ApiTokenType,
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
} from '../../../../lib/types/index.js';
import { AuthorizationTokenKind } from '../../../../lib/authentication/authorization-token.js';
import getLogger from '../../../fixtures/no-logger.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import { vi } from 'vitest';
import { ApiTokenV2Store } from '../../../../lib/features/apitokensv2/api-token-v2-store.js';

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
    await app.services.transactionalApiTokenV2Service.create(
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

test('lists, updates, and deletes secure tokens when secure token storage is disabled', async () => {
    const created = await app.services.transactionalApiTokenV2Service.create(
        {
            projects: ['default'],
            tokenName: 'secure-token-after-rollback',
            type: ApiTokenType.BACKEND,
            environment: 'development',
            userCreated: true,
        },
        SYSTEM_USER_AUDIT,
    );

    const experiments = (
        app.config.flagResolver as unknown as {
            experiments: { secureTokenStorage: boolean };
        }
    ).experiments;
    const previousSecureTokenStorage = experiments.secureTokenStorage;
    experiments.secureTokenStorage = false;

    try {
        const listResponse = await app.request
            .get('/api/admin/api-tokens')
            .expect(200);

        expect(listResponse.body.tokens).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    tokenName: 'secure-token-after-rollback',
                    secret: created.selector,
                    secure: true,
                }),
            ]),
        );

        const expiresAt = new Date(Date.now() + 60_000).toISOString();
        await app.request
            .put(`/api/admin/api-tokens/${created.selector}`)
            .send({ expiresAt })
            .expect(200);

        const updatedResponse = await app.request
            .get('/api/admin/api-tokens')
            .expect(200);
        expect(updatedResponse.body.tokens).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    tokenName: 'secure-token-after-rollback',
                    expiresAt,
                }),
            ]),
        );

        await app.request
            .delete(`/api/admin/api-tokens/${created.selector}`)
            .expect(200);

        const emptyResponse = await app.request
            .get('/api/admin/api-tokens')
            .expect(200);
        expect(emptyResponse.body.tokens).toEqual([]);
    } finally {
        experiments.secureTokenStorage = previousSecureTokenStorage;
    }
});

test('only warms the cache with non-expired secure tokens', async () => {
    const active = await app.services.transactionalApiTokenV2Service.create(
        {
            projects: ['default'],
            tokenName: 'active-secure-token',
            type: ApiTokenType.BACKEND,
            environment: 'development',
            userCreated: true,
        },
        SYSTEM_USER_AUDIT,
    );
    const expired = await app.services.transactionalApiTokenV2Service.create(
        {
            projects: ['default'],
            tokenName: 'expired-secure-token',
            type: ApiTokenType.BACKEND,
            environment: 'development',
            userCreated: true,
            expiresAt: new Date(Date.now() - 60_000),
        },
        SYSTEM_USER_AUDIT,
    );
    const getBySelector = vi.spyOn(ApiTokenV2Store.prototype, 'getBySelector');

    await app.services.apiTokenV2Service.fetchActiveTokens();

    await expect(
        app.services.apiTokenV2Service.getTokenWithCache({
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            secret: active.secret,
            selector: active.selector,
        }),
    ).resolves.toMatchObject({ secret: active.selector });
    expect(getBySelector).not.toHaveBeenCalled();

    await expect(
        app.services.apiTokenV2Service.getTokenWithCache({
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            secret: expired.secret,
            selector: expired.selector,
        }),
    ).resolves.toBeUndefined();
    expect(getBySelector).toHaveBeenCalledWith(expired.selector);
    getBySelector.mockRestore();
});
