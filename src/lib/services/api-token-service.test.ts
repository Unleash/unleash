import { ApiTokenService } from './api-token-service';
import { createTestConfig } from '../../test/config/test-config';
import { IUnleashConfig, IUnleashOptions, IUser } from '../server-impl';
import { ApiTokenType, IApiTokenCreate } from '../types/models/api-token';
import FakeApiTokenStore from '../../test/fixtures/fake-api-token-store';
import FakeEnvironmentStore from '../features/project-environments/fake-environment-store';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import {
    ADMIN_TOKEN_USER,
    API_TOKEN_CREATED,
    API_TOKEN_DELETED,
    API_TOKEN_UPDATED,
} from '../types';
import { addDays } from 'date-fns';
import EventService from '../features/events/event-service';
import FakeFeatureTagStore from '../../test/fixtures/fake-feature-tag-store';
import { createFakeEventsService } from '../../lib/features';

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
    await apiTokenService.updateExpiry(saved.secret, newExpiry, 'test', -9999);
    await apiTokenService.delete(saved.secret, 'test', -9999);
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
        ADMIN_TOKEN_USER as IUser,
    );

    const user = await tokenService.getUserForToken(token.secret);
    expect(user).toBeDefined();
    expect(user!.username).toBe(token.tokenName);
    expect(user!.internalAdminTokenUserId).toBe(ADMIN_TOKEN_USER.id);
});

describe('When token is added by another instance', () => {
    const setup = (options?: IUnleashOptions) => {
        const token: IApiTokenCreate = {
            environment: 'default',
            projects: ['*'],
            secret: '*:*:some-random-string',
            type: ApiTokenType.CLIENT,
            tokenName: 'new-token-by-another-instance',
            expiresAt: undefined,
        };

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
            token,
        };
    };
    test('should not return the token when query db flag is disabled', async () => {
        const { apiTokenService, apiTokenStore, token } = setup();

        // simulate this token being inserted by another instance (apiTokenService does not know about it)
        apiTokenStore.insert(token);

        const found = await apiTokenService.getUserForToken(token.secret);
        expect(found).toBeUndefined();
    });

    test('should return the token when query db flag is enabled', async () => {
        const { apiTokenService, apiTokenStore, token } = setup({
            experimental: {
                flags: {
                    queryMissingTokens: true,
                },
            },
        });

        // simulate this token being inserted by another instance (apiTokenService does not know about it)
        apiTokenStore.insert(token);

        const found = await apiTokenService.getUserForToken(token.secret);
        expect(found).toBeDefined();
        expect(found?.username).toBe(token.tokenName);
    });
});
