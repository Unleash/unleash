import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import type { IUnleashStores } from '../../../lib/types/index.js';
import { ApiTokenType } from '../../../lib/types/model.js';
import { DEFAULT_ENV, randomId } from '../../../lib/util/index.js';

let stores: IUnleashStores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('api_token_store_serial', getLogger);
    stores = db.stores;
});

beforeEach(async () => {
    await stores.apiTokenStore.deleteAll();
});

afterAll(async () => {
    await db.destroy();
});

test('get token is undefined when not exist', async () => {
    const token = await stores.apiTokenStore.get('abcde123');
    expect(token).toBeUndefined();
});

test('get token returns the token when exists', async () => {
    const newToken = await stores.apiTokenStore.insert({
        secret: 'abcde321',
        environment: DEFAULT_ENV,
        type: ApiTokenType.ADMIN,
        projects: [],
        tokenName: 'admin-test-token',
    });
    const foundToken = await stores.apiTokenStore.get('abcde321');
    expect(foundToken).toBeDefined();
    expect(foundToken!.secret).toBe(newToken.secret);
    expect(foundToken!.environment).toBe(newToken.environment);
    expect(foundToken!.tokenName).toBe(newToken.tokenName);
    expect(foundToken!.type).toBe(newToken.type);
});

describe('count deprecated tokens', () => {
    test('should return 0 if there is no legacy or orphaned tokens', async () => {
        await stores.projectStore.create({
            id: 'test',
            name: 'test',
        });
        await stores.apiTokenStore.insert({
            secret: '*:*.be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178',
            environment: DEFAULT_ENV,
            type: ApiTokenType.ADMIN,
            projects: [],
            tokenName: 'admin-token',
        });
        await stores.apiTokenStore.insert({
            secret: 'default:development.be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178',
            environment: DEFAULT_ENV,
            type: ApiTokenType.BACKEND,
            projects: ['default'],
            tokenName: 'client-token',
        });
        await stores.apiTokenStore.insert({
            secret: '*:development.be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178',
            environment: DEFAULT_ENV,
            type: ApiTokenType.BACKEND,
            projects: [],
            tokenName: 'client-wildcard-token',
        });
        await stores.apiTokenStore.insert({
            secret: '[]:production.3d6bdada42ddbd63a019d26955178be44368985f7fb3237c584ef86f',
            environment: DEFAULT_ENV,
            type: ApiTokenType.FRONTEND,
            projects: ['default', 'test'],
            tokenName: 'frontend-token',
        });

        const deprecatedTokens =
            await stores.apiTokenStore.countDeprecatedTokens();

        expect(deprecatedTokens).toEqual({
            activeLegacyTokens: 0,
            activeOrphanedTokens: 0,
            legacyTokens: 0,
            orphanedTokens: 0,
        });
    });

    test('should return 1 for legacy tokens', async () => {
        await stores.apiTokenStore.insert({
            secret: 'be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178',
            environment: DEFAULT_ENV,
            type: ApiTokenType.ADMIN,
            projects: [],
            tokenName: 'admin-test-token',
        });

        const deprecatedTokens =
            await stores.apiTokenStore.countDeprecatedTokens();

        expect(deprecatedTokens).toEqual({
            activeLegacyTokens: 0,
            activeOrphanedTokens: 0,
            legacyTokens: 1,
            orphanedTokens: 0,
        });
    });

    test('should return 1 for orphaned tokens', async () => {
        await stores.apiTokenStore.insert({
            secret: 'deleted-project:development.be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178',
            environment: DEFAULT_ENV,
            type: ApiTokenType.BACKEND,
            projects: [],
            tokenName: 'admin-test-token',
        });

        const deprecatedTokens =
            await stores.apiTokenStore.countDeprecatedTokens();

        expect(deprecatedTokens).toEqual({
            activeLegacyTokens: 0,
            activeOrphanedTokens: 0,
            legacyTokens: 0,
            orphanedTokens: 1,
        });
    });

    test('should not count wildcard tokens as orphaned', async () => {
        await stores.apiTokenStore.insert({
            secret: '*:*.be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178',
            environment: DEFAULT_ENV,
            type: ApiTokenType.BACKEND,
            projects: [],
            tokenName: 'client-test-token',
        });

        const deprecatedTokens =
            await stores.apiTokenStore.countDeprecatedTokens();

        expect(deprecatedTokens).toEqual({
            activeLegacyTokens: 0,
            activeOrphanedTokens: 0,
            legacyTokens: 0,
            orphanedTokens: 0,
        });
    });

    test('should count active tokens based on seen_at', async () => {
        const legacyTokenSecret =
            'be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178';
        const orphanedTokenSecret =
            '[]:production.be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178';
        await stores.apiTokenStore.insert({
            secret: legacyTokenSecret,
            environment: DEFAULT_ENV,
            type: ApiTokenType.ADMIN,
            projects: [],
            tokenName: 'admin-test-token',
        });
        await stores.apiTokenStore.insert({
            secret: orphanedTokenSecret,
            environment: DEFAULT_ENV,
            type: ApiTokenType.FRONTEND,
            projects: [],
            tokenName: 'frontend-test-token',
        });

        await stores.apiTokenStore.markSeenAt([
            legacyTokenSecret,
            orphanedTokenSecret,
        ]);

        const deprecatedTokens =
            await stores.apiTokenStore.countDeprecatedTokens();

        expect(deprecatedTokens).toEqual({
            activeLegacyTokens: 1,
            activeOrphanedTokens: 1,
            legacyTokens: 1,
            orphanedTokens: 1,
        });
    });
});

describe('count project tokens', () => {
    test('counts only tokens belonging to the specified project', async () => {
        const project = await stores.projectStore.create({
            id: randomId(),
            name: 'project A',
        });

        const store = stores.apiTokenStore;
        await store.insert({
            secret: `default:default.${randomId()}`,
            environment: DEFAULT_ENV,
            type: ApiTokenType.BACKEND,
            projects: ['default'],
            tokenName: 'token1',
        });
        await store.insert({
            secret: `*:*.${randomId()}`,
            environment: DEFAULT_ENV,
            type: ApiTokenType.BACKEND,
            projects: ['*'],
            tokenName: 'token2',
        });

        await store.insert({
            secret: `${project.id}:default.${randomId()}`,
            environment: DEFAULT_ENV,
            type: ApiTokenType.BACKEND,
            projects: [project.id],
            tokenName: 'token3',
        });

        await store.insert({
            secret: `[]:default.${randomId()}`,
            environment: DEFAULT_ENV,
            type: ApiTokenType.BACKEND,
            projects: [project.id, 'default'],
            tokenName: 'token4',
        });

        expect(await store.countProjectTokens(project.id)).toBe(2);
    });
});
