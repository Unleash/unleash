import dbInit, { type ITestDb } from '../helpers/database-init.js';
import type { IUnleashStores } from '../../../lib/types/index.js';
import { beforeAll, test, expect } from 'vitest';
let stores: IUnleashStores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit();
    stores = db.stores;
});

beforeEach(async () => {
    await stores.userStore.deleteAll();
});

test('should have no users', async () => {
    const readModel = stores.userUpdatesReadModel;
    const lastUpdatedAt = await readModel.getLastUpdatedAt();
    expect(lastUpdatedAt).toBeNull();

    const users = await readModel.getUsersUpdatedAfter(new Date(0));
    expect(users).toEqual([]);
});

test('Adding a user should return that user', async () => {
    const readModel = stores.userUpdatesReadModel;
    const userStore = stores.userStore;
    const beforeInsert = new Date(Date.now() - 1000);
    await userStore.upsert({ email: 'test@example.com' });

    const lastUpdatedAt = await readModel.getLastUpdatedAt();
    expect(lastUpdatedAt).toBeDefined();
    expect(lastUpdatedAt).toBeInstanceOf(Date);
    // check that it's recent
    expect(lastUpdatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeInsert.getTime(),
    );

    const users = await readModel.getUsersUpdatedAfter(beforeInsert);
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('test@example.com');
    expect(users[0].createdAt).toBeInstanceOf(Date);
    expect(users[0].updatedAt).toBeInstanceOf(Date);
    expect(users[0].deletedAt).toBeNull();
});

test('Modifying a user should return that user', async () => {
    const readModel = stores.userUpdatesReadModel;
    const userStore = stores.userStore;
    const inserted = await userStore.upsert({
        email: 'test@example.com',
    });

    const afterInsert = new Date();
    const lastUpdatedAt = await readModel.getLastUpdatedAt();
    expect(lastUpdatedAt).toBeDefined();
    expect(lastUpdatedAt).toBeInstanceOf(Date);

    const users = await readModel.getUsersUpdatedAfter(afterInsert);
    expect(users).toHaveLength(0);

    await userStore.update(inserted.id, { name: 'New Name' });

    const lastUpdatedAt2 = await readModel.getLastUpdatedAt();
    expect(lastUpdatedAt2).toBeDefined();
    expect(lastUpdatedAt2).toBeInstanceOf(Date);
    expect(lastUpdatedAt2!.getTime()).toBeGreaterThanOrEqual(
        lastUpdatedAt!.getTime(),
    );

    const users2 = await readModel.getUsersUpdatedAfter(afterInsert);
    expect(users2).toHaveLength(1);
    expect(users2[0].email).toBe('test@example.com');
    expect(users2[0].name).toBe('New Name');
    expect(users2[0].createdAt).toBeInstanceOf(Date);
    expect(users2[0].updatedAt).toBeInstanceOf(Date);
    expect(users2[0].deletedAt).toBeNull();
});

test('Deleting a user should return that user', async () => {
    const readModel = stores.userUpdatesReadModel;
    const userStore = stores.userStore;
    const inserted = await userStore.upsert({
        email: 'test@example.com',
    });

    const afterInsert = new Date();
    const lastUpdatedAt = await readModel.getLastUpdatedAt();
    expect(lastUpdatedAt).toBeDefined();
    expect(lastUpdatedAt).toBeInstanceOf(Date);

    const users = await readModel.getUsersUpdatedAfter(afterInsert);
    expect(users).toHaveLength(0);

    await userStore.delete(inserted.id);

    const lastUpdatedAt2 = await readModel.getLastUpdatedAt();
    expect(lastUpdatedAt2).toBeDefined();
    expect(lastUpdatedAt2).toBeInstanceOf(Date);
    expect(lastUpdatedAt2!.getTime()).toBeGreaterThanOrEqual(
        lastUpdatedAt!.getTime(),
    );

    const users2 = await readModel.getUsersUpdatedAfter(afterInsert);
    expect(users2).toHaveLength(1);
    expect(users2[0].email).toBeNull(); // currently we nullify the email but this might change in the future
    expect(users2[0].createdAt).toBeInstanceOf(Date);
    expect(users2[0].updatedAt).toBeInstanceOf(Date);
    expect(users2[0].deletedAt).toBeInstanceOf(Date);
});
