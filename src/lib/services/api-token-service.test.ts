import { ApiTokenService } from './api-token-service';
import { createTestConfig } from '../../test/config/test-config';
import { IUnleashConfig } from '../server-impl';
import { ApiTokenType, IApiTokenCreate } from '../types/models/api-token';
import FakeApiTokenStore from '../../test/fixtures/fake-api-token-store';
import FakeEnvironmentStore from '../../test/fixtures/fake-environment-store';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import {
    API_TOKEN_CREATED,
    API_TOKEN_DELETED,
    API_TOKEN_UPDATED,
} from '../types';
import { addDays } from 'date-fns';

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
    });
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();
    const eventStore = new FakeEventStore();
    const insertCalled = new Promise((resolve) => {
        apiTokenStore.on('insert', resolve);
    });

    new ApiTokenService(
        { apiTokenStore, environmentStore, eventStore },
        config,
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
        expiresAt: null,
    };

    const config: IUnleashConfig = createTestConfig({});
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();
    const eventStore = new FakeEventStore();

    await environmentStore.create({
        name: 'default',
        enabled: true,
        protected: true,
        type: 'test',
        sortOrder: 1,
    });

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore, eventStore },
        config,
    );

    await apiTokenService.createApiTokenWithProjects(token);
    await apiTokenService.fetchActiveTokens();

    expect(apiTokenService.getUserForToken(undefined)).toEqual(undefined);
    expect(apiTokenService.getUserForToken('')).toEqual(undefined);
});

test('Api token operations should all have events attached', async () => {
    const token: IApiTokenCreate = {
        environment: 'default',
        projects: ['*'],
        secret: '*:*:some-random-string',
        type: ApiTokenType.FRONTEND,
        tokenName: 'front',
        expiresAt: null,
    };

    const config: IUnleashConfig = createTestConfig({});
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();
    const eventStore = new FakeEventStore();

    await environmentStore.create({
        name: 'default',
        enabled: true,
        protected: true,
        type: 'test',
        sortOrder: 1,
    });

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore, eventStore },
        config,
    );
    let saved = await apiTokenService.createApiTokenWithProjects(token);
    let newExpiry = addDays(new Date(), 30);
    await apiTokenService.updateExpiry(saved.secret, newExpiry, 'test');
    await apiTokenService.delete(saved.secret, 'test');
    const events = await eventStore.getEvents();
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
