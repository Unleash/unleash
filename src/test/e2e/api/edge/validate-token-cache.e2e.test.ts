import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    setupAppWithCustomConfig,
    type IUnleashTest,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    ApiTokenType,
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
} from '../../../../lib/types/index.js';
import {
    AuthorizationTokenKind,
    parseAuthorizationToken,
} from '../../../../lib/authentication/authorization-token.js';
import { TOKEN_CACHE_LOOKUP } from '../../../../lib/metric-events.js';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('edge_validate_shared_cache', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            edgeMasterKey: '5ja3QXrqi4T2A+V+0QOw8eTA68lsHQE81vNO80MGrhw=',
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app?.destroy();
    await db?.destroy();
});

test('Edge validation uses the main legacy cache after hourly revalidation and refresh', async () => {
    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            tokenName: 'hourly edge validation',
            type: ApiTokenType.BACKEND,
            projects: ['*'],
            environment: 'development',
        },
    );
    await app.request
        .post('/edge/validate')
        .send({ tokens: [token.secret] })
        .expect(200);

    // Simulate the next hourly validation, after the private cache would expire.
    // The scheduler keeps the shared legacy cache warm every minute.
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now + 60 * 60 * 1000);
    const load = vi.spyOn(app.services.apiTokenService, 'getToken');
    try {
        await app.services.apiTokenService.fetchActiveTokens();
        await app.request
            .post('/edge/validate')
            .send({ tokens: [token.secret] })
            .expect(200)
            .expect(({ body }) => expect(body.tokens).toHaveLength(1));
        expect(load).not.toHaveBeenCalled();
    } finally {
        clock.mockRestore();
        load.mockRestore();
    }
});

test('Edge validation discovers aliases and observes legacy revocation through the main refresh', async () => {
    const token = await db.stores.apiTokenStore.insert(
        {
            tokenName: 'migrated proxy',
            secret: '*:development.edge-alias-secret',
            alias: 'edge-deprecated-alias',
            type: ApiTokenType.BACKEND,
            projects: ['*'],
            environment: 'development',
        },
        SYSTEM_USER_ID,
    );
    await app.services.apiTokenService.fetchActiveTokens();
    await app.request
        .post('/edge/validate')
        .send({ tokens: [token.secret, token.alias] })
        .expect(200)
        .expect(({ body }) => expect(body.tokens).toHaveLength(2));

    await app.services.apiTokenService.delete(token.secret, SYSTEM_USER_AUDIT);
    await app.services.apiTokenService.fetchActiveTokens();
    await app.request
        .post('/edge/validate')
        .send({ tokens: [token.secret, token.alias] })
        .expect(200, { tokens: [] });
});

test('Edge validation reuses the secure-token cache and observes revision invalidation', async () => {
    const token =
        await app.services.transactionalApiTokenV2Service.transactional(
            (service) =>
                service.create(
                    {
                        tokenName: 'shared secure token',
                        type: ApiTokenType.BACKEND,
                        projects: ['*'],
                        environment: 'development',
                        userCreated: true,
                    },
                    SYSTEM_USER_AUDIT,
                ),
        );
    const credential = parseAuthorizationToken(token.secret)!;
    if (
        credential.kind !== AuthorizationTokenKind.API_TOKEN ||
        credential.version !== 'v2'
    ) {
        throw new Error('Expected a secure API token');
    }
    await app.services.apiTokenV2Service.getTokenWithCache(credential);
    const lookups: { cache: string; result: string }[] = [];
    const record = (event: { cache: string; result: string }) =>
        lookups.push(event);
    app.config.eventBus.on(TOKEN_CACHE_LOOKUP, record);
    try {
        await app.request
            .post('/edge/validate')
            .send({ tokens: [token.secret] })
            .expect(200)
            .expect(({ body }) => expect(body.tokens).toHaveLength(1));
        expect(lookups).toContainEqual({
            cache: 'secure-tokens-cache-v2',
            result: 'hit',
        });
        expect(lookups.some(({ result }) => result === 'miss')).toBe(false);
    } finally {
        app.config.eventBus.off(TOKEN_CACHE_LOOKUP, record);
    }

    await app.services.transactionalApiTokenV2Service.transactional((service) =>
        service.delete(credential, SYSTEM_USER_AUDIT),
    );
    await app.services.apiTokenV2Service.pollTokenChanges();
    await app.request
        .post('/edge/validate')
        .send({ tokens: [token.secret] })
        .expect(200, { tokens: [] });
});

test('rolled-back Edge issuance does not populate the shared validation cache', async () => {
    await app.services.edgeService.saveClient(
        'rollback-edge',
        'rollback-secret',
    );
    let secret = '';
    await expect(
        app.services.edgeService.transactional(async (service) => {
            const issued = await service.getOrCreateTokens('rollback-edge', {
                tokens: [{ environment: 'development', projects: ['*'] }],
            });
            secret = issued.tokens[0].token;
            throw new Error('Roll back issuance');
        }),
    ).rejects.toThrow('Roll back issuance');
    expect(secret).not.toBe('');
    expect(await db.stores.apiTokenStore.get(secret)).toBeUndefined();
    const credential = parseAuthorizationToken(secret);
    if (
        credential?.kind === AuthorizationTokenKind.API_TOKEN &&
        credential.version === 'v2'
    ) {
        expect(
            await db.stores.apiTokenV2Store.getBySelector(credential.selector),
        ).toBeUndefined();
    }
    await app.request
        .post('/edge/validate')
        .send({ tokens: [secret] })
        .expect(200, { tokens: [] });
});
