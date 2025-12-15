import { createTestConfig } from '../../test/config/test-config.js';
import type { IUnleashConfig, IUnleashOptions, IUser } from '../types/index.js';
import { ApiTokenType, type IApiTokenCreate } from '../types/model.js';
import {
    ADMIN_TOKEN_USER,
    SYSTEM_USER,
    TEST_AUDIT_USER,
} from '../types/index.js';
import { addDays, minutesToMilliseconds, subDays } from 'date-fns';
import { DEFAULT_ENV, extractAuditInfoFromUser } from '../util/index.js';
import { createFakeApiTokenService } from '../features/api-tokens/createApiTokenService.js';
import {
    API_TOKEN_CREATED,
    API_TOKEN_DELETED,
    API_TOKEN_UPDATED,
} from '../events/index.js';
import { vi } from 'vitest';

test('Should init api token', async () => {
    const token = {
        environment: '*',
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: ApiTokenType.ADMIN,
        tokenName: 'admin',
    };

    const config: IUnleashConfig = createTestConfig({
        authentication: {
            initApiTokens: [token],
        },
        experimental: {
            flags: {
                useMemoizedActiveTokens: true,
            },
        },
    });
    const { apiTokenService, apiTokenStore } =
        createFakeApiTokenService(config);
    const insertCalled = new Promise((resolve) => {
        apiTokenStore.on('insert', resolve);
    });
    apiTokenService.initApiTokens([token]);
    await insertCalled;

    const tokens = await apiTokenStore.getAll();

    expect(tokens).toHaveLength(1);
});

test("Shouldn't return frontend token when secret is undefined", async () => {
    const token: IApiTokenCreate = {
        environment: DEFAULT_ENV,
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: ApiTokenType.FRONTEND,
        tokenName: 'front',
        expiresAt: undefined,
    };

    const config: IUnleashConfig = createTestConfig({});
    const { environmentStore, apiTokenService } =
        createFakeApiTokenService(config);
    await environmentStore.create({
        name: DEFAULT_ENV,
        enabled: true,
        type: 'test',
        sortOrder: 1,
    });

    await apiTokenService.createApiTokenWithProjects(token);
    await apiTokenService.fetchActiveTokens();

    expect(await apiTokenService.getUserForToken('')).toEqual(undefined);
});

test('Api token operations should all have events attached', async () => {
    const token: IApiTokenCreate = {
        environment: DEFAULT_ENV,
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: ApiTokenType.FRONTEND,
        tokenName: 'front',
        expiresAt: undefined,
    };

    const config: IUnleashConfig = createTestConfig({});

    const { environmentStore, apiTokenService, eventService } =
        createFakeApiTokenService(config);
    await environmentStore.create({
        name: DEFAULT_ENV,
        enabled: true,
        type: 'test',
        sortOrder: 1,
    });

    const saved = await apiTokenService.createApiTokenWithProjects(token);
    const newExpiry = addDays(new Date(), 30);
    await apiTokenService.updateExpiry(
        saved.secret,
        newExpiry,
        TEST_AUDIT_USER,
    );
    await apiTokenService.delete(saved.secret, TEST_AUDIT_USER);
    const { events } = await eventService.getEvents();
    const createdApiTokenEvents = events.filter(
        (e) => e.type === API_TOKEN_CREATED,
    );
    expect(createdApiTokenEvents).toHaveLength(1);
    expect(createdApiTokenEvents[0].preData).toBeUndefined();
    expect(createdApiTokenEvents[0].data.secret).toBeUndefined();

    const updatedApiTokenEvents = events.filter(
        (e) => e.type === API_TOKEN_UPDATED,
    );
    expect(updatedApiTokenEvents).toHaveLength(1);
    expect(updatedApiTokenEvents[0].preData.expiresAt).toBeUndefined();
    expect(updatedApiTokenEvents[0].preData.secret).toBeUndefined();
    expect(updatedApiTokenEvents[0].data.secret).toBeUndefined();
    expect(updatedApiTokenEvents[0].data.expiresAt).toBe(newExpiry);

    const deletedApiTokenEvents = events.filter(
        (e) => e.type === API_TOKEN_DELETED,
    );
    expect(deletedApiTokenEvents).toHaveLength(1);
    expect(deletedApiTokenEvents[0].data).toBeUndefined();
    expect(deletedApiTokenEvents[0].preData).toBeDefined();
    expect(deletedApiTokenEvents[0].preData.secret).toBeUndefined();
});

test('getUserForToken should get a user with admin token user id and token name', async () => {
    const config = createTestConfig();
    const { apiTokenService } = createFakeApiTokenService(config);
    const token = await apiTokenService.createApiTokenWithProjects(
        {
            environment: '*',
            projects: ['*'],
            type: ApiTokenType.ADMIN,
            tokenName: 'admin.token',
        },
        extractAuditInfoFromUser(ADMIN_TOKEN_USER as IUser),
    );

    const user = await apiTokenService.getUserForToken(token.secret);
    expect(user).toBeDefined();
    expect(user!.username).toBe(token.tokenName);
    expect(user!.internalAdminTokenUserId).toBe(ADMIN_TOKEN_USER.id);
});

describe('API token getTokenWithCache', () => {
    const token: IApiTokenCreate = {
        environment: DEFAULT_ENV,
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: ApiTokenType.CLIENT,
        tokenName: 'new-token-by-another-instance',
        expiresAt: undefined,
    };

    const setup = (options?: IUnleashOptions) => {
        const config: IUnleashConfig = createTestConfig(options);
        const { apiTokenService, apiTokenStore } =
            createFakeApiTokenService(config);
        return {
            apiTokenService,
            apiTokenStore,
        };
    };

    test('should return the token and perform only one db query', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const apiTokenStoreGet = vi.spyOn(apiTokenStore, 'get');

        // valid token not present in cache (could be inserted by another instance)
        apiTokenStore.insert(token);

        for (let i = 0; i < 5; i++) {
            const found = await apiTokenService.getTokenWithCache(token.secret);
            expect(found).toBeDefined();
            expect(found?.tokenName).toBe(token.tokenName);
            expect(found?.createdAt).toBeDefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(1);
    });

    test('should query the db only once for invalid tokens', async () => {
        vi.useFakeTimers();
        const { apiTokenService, apiTokenStore } = setup();
        const apiTokenStoreGet = vi.spyOn(apiTokenStore, 'get');

        const invalidToken = 'invalid-token';
        for (let i = 0; i < 5; i++) {
            expect(
                await apiTokenService.getTokenWithCache(invalidToken),
            ).toBeUndefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(1);

        // after more than 5 minutes we should be able to query again
        vi.advanceTimersByTime(minutesToMilliseconds(6));
        for (let i = 0; i < 5; i++) {
            expect(
                await apiTokenService.getTokenWithCache(invalidToken),
            ).toBeUndefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(2);
    });

    test('should not return the token if it has expired and shoud perform only one db query', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const apiTokenStoreGet = vi.spyOn(apiTokenStore, 'get');

        // valid token not present in cache but expired
        apiTokenStore.insert({ ...token, expiresAt: subDays(new Date(), 1) });

        for (let i = 0; i < 5; i++) {
            const found = await apiTokenService.getTokenWithCache(token.secret);
            expect(found).toBeUndefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(1);
    });
});

test('normalizes api token type casing to lowercase', async () => {
    const config: IUnleashConfig = createTestConfig();
    const { apiTokenStore, apiTokenService, environmentStore } =
        createFakeApiTokenService(config);

    await environmentStore.create({
        name: DEFAULT_ENV,
        enabled: true,
        type: 'test',
        sortOrder: 1,
    });

    const apiTokenStoreInsert = vi.spyOn(apiTokenStore, 'insert');

    await apiTokenService.createApiTokenWithProjects(
        {
            environment: DEFAULT_ENV,
            // @ts-expect-error
            type: 'CLIENT',
            projects: [],
            tokenName: 'uppercase-token',
        },
        SYSTEM_USER,
    );

    await apiTokenService.createApiTokenWithProjects(
        {
            environment: DEFAULT_ENV,
            // @ts-expect-error
            type: 'client',
            projects: [],
            tokenName: 'lowercase-token',
        },
        SYSTEM_USER,
    );

    expect(apiTokenStoreInsert).toHaveBeenCalledWith(
        expect.objectContaining({
            type: 'client',
        }),
    );

    expect(apiTokenStoreInsert).not.toHaveBeenCalledWith(
        expect.objectContaining({
            type: 'CLIENT',
        }),
    );

    const tokens = await apiTokenStore.getAll();
    expect(tokens.every((token) => token.type === 'client')).toBeTruthy();
});
