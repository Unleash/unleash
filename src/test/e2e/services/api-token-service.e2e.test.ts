import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { ApiTokenService } from '../../../lib/services/api-token-service';
import { createTestConfig } from '../../config/test-config';
import {
    ApiTokenType,
    IApiToken,
} from '../../../lib/types/stores/api-token-store';

let db;
let stores;
let apiTokenService: ApiTokenService;

beforeAll(async () => {
    const config = createTestConfig({
        server: { baseUriPath: '/test' },
    });
    db = await dbInit('api_token_service_serial', getLogger);
    stores = db.stores;
    // projectStore = stores.projectStore;
    apiTokenService = new ApiTokenService(stores, config);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
afterEach(async () => {
    const tokens = await stores.apiTokenStore.getAll();
    const deleteAll = tokens.map((t: IApiToken) =>
        stores.apiTokenStore.delete(t.secret),
    );
    await Promise.all(deleteAll);
});

test('should have empty list of tokens', async () => {
    const allTokens = await apiTokenService.getAllTokens();
    const activeTokens = await apiTokenService.getAllTokens();
    expect(allTokens.length).toBe(0);
    expect(activeTokens.length).toBe(0);
});

test('should create client token', async () => {
    const token = await apiTokenService.creteApiToken({
        username: 'default-client',
        type: ApiTokenType.CLIENT,
    });
    const allTokens = await apiTokenService.getAllTokens();

    expect(allTokens.length).toBe(1);
    expect(token.secret.length > 32).toBe(true);
    expect(token.type).toBe(ApiTokenType.CLIENT);
    expect(token.username).toBe('default-client');
    expect(allTokens[0].secret).toBe(token.secret);
});

test('should create admin token', async () => {
    const token = await apiTokenService.creteApiToken({
        username: 'admin',
        type: ApiTokenType.ADMIN,
    });

    expect(token.secret.length > 32).toBe(true);
    expect(token.type).toBe(ApiTokenType.ADMIN);
});

test('should set expiry of token', async () => {
    const time = new Date('2022-01-01');
    await apiTokenService.creteApiToken({
        username: 'default-client',
        type: ApiTokenType.CLIENT,
        expiresAt: time,
    });

    const [token] = await apiTokenService.getAllTokens();

    expect(token.expiresAt).toEqual(time);
});

test('should update expiry of token', async () => {
    const time = new Date('2022-01-01');
    const newTime = new Date('2023-01-01');

    const token = await apiTokenService.creteApiToken({
        username: 'default-client',
        type: ApiTokenType.CLIENT,
        expiresAt: time,
    });

    await apiTokenService.updateExpiry(token.secret, newTime);

    const [updatedToken] = await apiTokenService.getAllTokens();

    expect(updatedToken.expiresAt).toEqual(newTime);
});

test('should only return valid tokens', async () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    await apiTokenService.creteApiToken({
        username: 'default-expired',
        type: ApiTokenType.CLIENT,
        expiresAt: new Date('2021-01-01'),
    });

    const activeToken = await apiTokenService.creteApiToken({
        username: 'default-valid',
        type: ApiTokenType.CLIENT,
        expiresAt: tomorrow,
    });

    const tokens = await apiTokenService.getAllActiveTokens();

    expect(tokens.length).toBe(1);
    expect(activeToken.secret).toBe(tokens[0].secret);
});
