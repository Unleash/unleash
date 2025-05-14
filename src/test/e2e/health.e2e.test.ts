import { setupApp } from './helpers/test-helper.js';
import dbInit, { type ITestDb } from './helpers/database-init.js';
import getLogger from '../fixtures/no-logger.js';
import type { IUnleashStores } from '../../lib/types/index.js';

let stores: IUnleashStores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('health_api', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    await db.destroy();
});

test('returns health good', async () => {
    expect.assertions(0);
    const { request, destroy } = await setupApp(stores);
    await request
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect('{"health":"GOOD"}');
    await destroy();
});
