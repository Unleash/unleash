import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import type { IUnleashStores } from '../../../lib/types/index.js';
import { beforeAll, afterAll, test, expect } from 'vitest';
let stores: IUnleashStores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('user_store_serial', getLogger, {
        experimental: { flags: {} },
    });
    stores = db.stores;
});

afterAll(async () => {
    await db.destroy();
});

test('should have no users', async () => {
    const readModel = stores.userUpdatesReadModel;
    const lastUpdatedAt = await readModel.getLastUpdatedAt();
    expect(lastUpdatedAt).toBeNull();

    const users = await readModel.getUsersUpdatedAfter(new Date(0));
    expect(users).toEqual([]);
});

test('should have no users', async () => {
    const readModel = stores.userUpdatesReadModel;
    const lastUpdatedAt = await readModel.getLastUpdatedAt();
    expect(lastUpdatedAt).toBeNull();

    const users = await readModel.getUsersUpdatedAfter(new Date(0));
    expect(users).toEqual([]);
});
