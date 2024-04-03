import dbInit, { type ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import type { IUnleashStores } from '../../../lib/types';
import { ApiTokenType } from '../../../lib/types/models/api-token';

let stores: IUnleashStores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('api_token_store_serial', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    await db.destroy();
});

test('get token is undefined when not exist', async () => {
    const token = await stores.apiTokenStore.get('abcde123');
    expect(token).toBeUndefined();
});

test('get token returns the token when exists', async () => {
    const newToken = await stores.apiTokenStore.insert({
        secret: 'abcde321',
        environment: 'default',
        type: ApiTokenType.ADMIN,
        projects: [],
        tokenName: 'admin-test-token',
    });
    const foundToken = await stores.apiTokenStore.get('abcde321');
    expect(foundToken).toBeDefined();
    expect(foundToken.secret).toBe(newToken.secret);
    expect(foundToken.environment).toBe(newToken.environment);
    expect(foundToken.tokenName).toBe(newToken.tokenName);
    expect(foundToken.type).toBe(newToken.type);
});
