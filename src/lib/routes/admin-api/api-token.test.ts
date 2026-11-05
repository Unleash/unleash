import supertest from 'supertest';
import { createServices } from '../../services/index.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import createStores from '../../../test/fixtures/store.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import getApp from '../../app.js';
import { createFakeApiTokenService } from '../../features/api-tokens/createApiTokenService.js';
import {
    AuthorizationTokenKind,
    createTokenV2Credential,
} from '../../authentication/authorization-token.js';
import { ApiTokenType, SYSTEM_USER_ID } from '../../types/index.js';

class FailingEventStore extends FakeEventStore {
    async batchStoreOrThrow(): Promise<void> {
        throw new Error('event write failed');
    }
}

test('fails a secure token expiry update and delete when their events cannot be saved', async () => {
    const stores = { ...createStores(), eventStore: new FailingEventStore() };
    const config = createTestConfig();
    const request = supertest(
        await getApp(config, stores, createServices(stores, config)),
    );
    const { selector, verifier } = createTokenV2Credential({
        kind: AuthorizationTokenKind.API_TOKEN,
        tokenPrefix: 'default:development',
    });
    await stores.apiTokenV2Store.create(
        {
            tokenName: 'secure-token',
            type: ApiTokenType.BACKEND,
            projects: ['default'],
            environment: 'development',
            userCreated: true,
        },
        selector,
        verifier,
    );

    await request
        .put(`/api/admin/api-tokens/${selector}`)
        .send({ expiresAt: new Date(Date.now() + 60_000).toISOString() })
        .expect(500);
    await request.delete(`/api/admin/api-tokens/${selector}`).expect(500);
});

test('fails a secure token expiry update and delete when the token cannot be read', async () => {
    const stores = createStores();
    stores.apiTokenV2Store.getBySelector = async () => {
        throw new Error('token read failed');
    };
    const config = createTestConfig();
    const request = supertest(
        await getApp(config, stores, createServices(stores, config)),
    );
    const { selector } = createTokenV2Credential({
        kind: AuthorizationTokenKind.API_TOKEN,
        tokenPrefix: 'default:development',
    });

    await request
        .put(`/api/admin/api-tokens/${selector}`)
        .send({ expiresAt: new Date(Date.now() + 60_000).toISOString() })
        .expect(500);
    await request.delete(`/api/admin/api-tokens/${selector}`).expect(500);
});

test('fails a legacy token delete when the token cannot be deleted', async () => {
    const stores = createStores();
    const config = createTestConfig();
    const { apiTokenService, apiTokenStore } =
        createFakeApiTokenService(config);
    apiTokenStore.delete = async () => {
        throw new Error('token delete failed');
    };
    const request = supertest(
        await getApp(config, stores, {
            ...createServices(stores, config),
            apiTokenService,
        }),
    );
    const secret = 'default:development.legacy-token';
    await apiTokenStore.insert(
        {
            tokenName: 'legacy-token',
            type: ApiTokenType.BACKEND,
            projects: ['default'],
            environment: 'development',
            secret,
        },
        SYSTEM_USER_ID,
    );

    await request.delete(`/api/admin/api-tokens/${secret}`).expect(500);
});

test('fails a legacy token expiry update and delete when the token cannot be read', async () => {
    const stores = createStores();
    const config = createTestConfig();
    const { apiTokenService, apiTokenStore } =
        createFakeApiTokenService(config);
    apiTokenStore.get = async () => {
        throw new Error('token read failed');
    };
    const request = supertest(
        await getApp(config, stores, {
            ...createServices(stores, config),
            apiTokenService,
        }),
    );
    const secret = 'default:development.legacy-token';

    await request
        .put(`/api/admin/api-tokens/${secret}`)
        .send({ expiresAt: new Date(Date.now() + 60_000).toISOString() })
        .expect(500);
    await request.delete(`/api/admin/api-tokens/${secret}`).expect(500);
});
