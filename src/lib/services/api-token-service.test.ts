import { ApiTokenService } from './api-token-service';
import { createTestConfig } from '../../test/config/test-config';
import { IUnleashConfig } from '../server-impl';
import { ApiTokenType } from '../types/models/api-token';
import FakeApiTokenStore from '../../test/fixtures/fake-api-token-store';

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
    const insertCalled = new Promise((resolve) => {
        apiTokenStore.on('insert', resolve);
    });

    new ApiTokenService({ apiTokenStore }, config);

    await insertCalled;

    const tokens = await apiTokenStore.getAll();

    expect(tokens).toHaveLength(1);
});
