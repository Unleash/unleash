import { ApiTokenService } from './api-token-service';
import { createTestConfig } from '../../test/config/test-config';
import { IUnleashConfig } from '../server-impl';
import { ApiTokenType, IApiTokenCreate } from '../types/models/api-token';
import FakeApiTokenStore from '../../test/fixtures/fake-api-token-store';
import FakeEnvironmentStore from '../../test/fixtures/fake-environment-store';

test('Should init api token', async () => {
    const token = {
        environment: '*',
        project: '*',
        secret: '*:*:some-random-string',
        type: ApiTokenType.ADMIN,
        username: 'admin',
    };

    const config: IUnleashConfig = createTestConfig({
        authentication: {
            initApiTokens: [token],
        },
    });
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();
    const insertCalled = new Promise((resolve) => {
        apiTokenStore.on('insert', resolve);
    });

    new ApiTokenService({ apiTokenStore, environmentStore }, config);

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
        username: 'front',
        expiresAt: null,
    };

    const config: IUnleashConfig = createTestConfig({});
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();

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
    );

    await apiTokenService.createApiTokenWithProjects(token);
    await apiTokenService.fetchActiveTokens();

    expect(apiTokenService.getUserForToken(undefined)).toEqual(undefined);
    expect(apiTokenService.getUserForToken('')).toEqual(undefined);
});
