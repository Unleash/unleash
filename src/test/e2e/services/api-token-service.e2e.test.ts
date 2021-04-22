import test from 'ava';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { ApiTokenService } from '../../../lib/services/api-token-service';
import { ApiTokenType, IApiToken } from '../../../lib/db/api-token-store';
import { createTestConfig } from '../../config/test-config';

let db;
let stores;
let apiTokenService: ApiTokenService;

test.before(async () => {
    const config = createTestConfig({
        server: { baseUriPath: '/test' },
    });
    db = await dbInit('api_token_service_serial', getLogger);
    stores = db.stores;
    // projectStore = stores.projectStore;
    apiTokenService = new ApiTokenService(stores, config);
});

test.after(async () => {
    await db.destroy();
});

test.afterEach(async () => {
    const tokens = await stores.apiTokenStore.getAll();
    const deleteAll = tokens.map((t: IApiToken) =>
        stores.apiTokenStore.delete(t.secret),
    );
    await Promise.all(deleteAll);
});

test.serial('should have empty list of tokens', async t => {
    const allTokens = await apiTokenService.getAllTokens();
    const activeTokens = await apiTokenService.getAllTokens();
    t.is(allTokens.length, 0);
    t.is(activeTokens.length, 0);
});

test.serial('should create client token', async t => {
    const token = await apiTokenService.creteApiToken({
        username: 'default-client',
        type: ApiTokenType.CLIENT,
    });
    const allTokens = await apiTokenService.getAllTokens();

    t.is(allTokens.length, 1);
    t.true(token.secret.length > 32);
    t.is(token.type, ApiTokenType.CLIENT);
    t.is(token.username, 'default-client');
    t.is(allTokens[0].secret, token.secret);
});

test.serial('should create admin token', async t => {
    const token = await apiTokenService.creteApiToken({
        username: 'admin',
        type: ApiTokenType.ADMIN,
    });

    t.true(token.secret.length > 32);
    t.is(token.type, ApiTokenType.ADMIN);
});

test.serial('should set expiry of token', async t => {
    const time = new Date('2022-01-01');
    await apiTokenService.creteApiToken({
        username: 'default-client',
        type: ApiTokenType.CLIENT,
        expiresAt: time,
    });

    const [token] = await apiTokenService.getAllTokens();

    t.deepEqual(token.expiresAt, time);
});

test.serial('should update expiry of token', async t => {
    const time = new Date('2022-01-01');
    const newTime = new Date('2023-01-01');

    const token = await apiTokenService.creteApiToken({
        username: 'default-client',
        type: ApiTokenType.CLIENT,
        expiresAt: time,
    });

    await apiTokenService.updateExpiry(token.secret, newTime);

    const [updatedToken] = await apiTokenService.getAllTokens();

    t.deepEqual(updatedToken.expiresAt, newTime);
});

test.serial('should only return valid tokens', async t => {
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

    t.is(tokens.length, 1);
    t.is(activeToken.secret, tokens[0].secret);
});
