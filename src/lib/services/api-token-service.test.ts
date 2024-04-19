import { ApiTokenService } from './api-token-service';
import { createTestConfig } from '../../test/config/test-config';
import type { IUnleashConfig, IUnleashOptions, IUser } from '../server-impl';
import { ApiTokenType, type IApiTokenCreate } from '../types/models/api-token';
import FakeApiTokenStore from '../../test/fixtures/fake-api-token-store';
import FakeEnvironmentStore from '../features/project-environments/fake-environment-store';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import {
    ADMIN_TOKEN_USER,
    API_TOKEN_CREATED,
    API_TOKEN_DELETED,
    API_TOKEN_UPDATED,
    TEST_AUDIT_USER,
} from '../types';
import { addDays, minutesToMilliseconds } from 'date-fns';
import EventService from '../features/events/event-service';
import FakeFeatureTagStore from '../../test/fixtures/fake-feature-tag-store';
import { createFakeEventsService } from '../../lib/features';
import { extractAuditInfoFromUser } from '../util';

const token: IApiTokenCreate = {
    environment: 'default',
    projects: ['*'],
    secret: '*:*:some-random-string',
    type: ApiTokenType.CLIENT,
    tokenName: 'new-token-by-another-instance',
    expiresAt: undefined,
};

const setup = (options?: IUnleashOptions) => {
    const config: IUnleashConfig = createTestConfig(options);
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        createFakeEventsService(config),
    );
    return {
        apiTokenService,
        apiTokenStore,
    };
};

test('Should init api token', async () => {
    const token = {
        environment: '*',
        project: '*',
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
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();
    const insertCalled = new Promise((resolve) => {
        apiTokenStore.on('insert', resolve);
    });

    const eventService = createFakeEventsService(config);

    new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
    );

    await insertCalled;

    const tokens = await apiTokenStore.getAll();

    expect(tokens).toHaveLength(1);
});

test("Shouldn't return frontend token when secret is undefined", async () => {
    const token: IApiTokenCreate = {
        environment: 'default',
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: ApiTokenType.FRONTEND,
        tokenName: 'front',
        expiresAt: undefined,
    };

    const config: IUnleashConfig = createTestConfig({});
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();

    const eventService = new EventService(
        {
            eventStore: new FakeEventStore(),
            featureTagStore: new FakeFeatureTagStore(),
        },
        config,
    );

    await environmentStore.create({
        name: 'default',
        enabled: true,
        protected: true,
        type: 'test',
        sortOrder: 1,
    });

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
    );

    await apiTokenService.createApiTokenWithProjects(token);
    await apiTokenService.fetchActiveTokens();

    expect(await apiTokenService.getUserForToken('')).toEqual(undefined);
});

test('Api token operations should all have events attached', async () => {
    const token: IApiTokenCreate = {
        environment: 'default',
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: ApiTokenType.FRONTEND,
        tokenName: 'front',
        expiresAt: undefined,
    };

    const config: IUnleashConfig = createTestConfig({});
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();

    const eventService = new EventService(
        {
            eventStore: new FakeEventStore(),
            featureTagStore: new FakeFeatureTagStore(),
        },
        config,
    );

    await environmentStore.create({
        name: 'default',
        enabled: true,
        protected: true,
        type: 'test',
        sortOrder: 1,
    });

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
    );
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
    expect(updatedApiTokenEvents[0].preData.expiresAt).toBeDefined();
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
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();

    const eventService = createFakeEventsService(config);

    const tokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
    );
    const token = await tokenService.createApiTokenWithProjects(
        {
            environment: '*',
            projects: ['*'],
            type: ApiTokenType.ADMIN,
            tokenName: 'admin.token',
        },
        extractAuditInfoFromUser(ADMIN_TOKEN_USER as IUser),
    );

    const user = await tokenService.getUserForToken(token.secret);
    expect(user).toBeDefined();
    expect(user!.username).toBe(token.tokenName);
    expect(user!.internalAdminTokenUserId).toBe(ADMIN_TOKEN_USER.id);
});

describe('API token getTokenWithCache', () => {
    test('should return the token and perform only one db query', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const apiTokenStoreGet = jest.spyOn(apiTokenStore, 'get');

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
        jest.useFakeTimers();
        const { apiTokenService, apiTokenStore } = setup();
        const apiTokenStoreGet = jest.spyOn(apiTokenStore, 'get');

        const invalidToken = 'invalid-token';
        for (let i = 0; i < 5; i++) {
            expect(
                await apiTokenService.getTokenWithCache(invalidToken),
            ).toBeUndefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(1);

        // after more than 5 minutes we should be able to query again
        jest.advanceTimersByTime(minutesToMilliseconds(6));
        for (let i = 0; i < 5; i++) {
            expect(
                await apiTokenService.getTokenWithCache(invalidToken),
            ).toBeUndefined();
        }
        expect(apiTokenStoreGet).toHaveBeenCalledTimes(2);
    });
});
