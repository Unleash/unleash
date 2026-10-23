import supertest from 'supertest';
import { createServices } from '../../services/index.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import createStores from '../../../test/fixtures/store.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import getApp from '../../app.js';
import {
    AuthorizationTokenKind,
    createTokenV2Credential,
} from '../../authentication/authorization-token.js';
import { ApiTokenType } from '../../types/index.js';

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
