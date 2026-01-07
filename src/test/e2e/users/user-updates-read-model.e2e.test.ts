import dbInit from '../helpers/database-init.js';
import { test, expect } from 'vitest';

test('should have no users', async () => {
    const db = await dbInit();
    const stores = db.stores;
    const readModel = stores.userUpdatesReadModel;
    const lastUpdate = await readModel.getLastUpdatedAt();
    expect(lastUpdate).toBeNull();

    const users = await readModel.getUsersUpdatedAfterOrEqual(new Date(0), 10);
    expect(users).toEqual([]);
});

test('Adding a user should return that user', async () => {
    const db = await dbInit();
    const stores = db.stores;
    const readModel = stores.userUpdatesReadModel;
    const userStore = stores.userStore;
    const beforeInsert = new Date(Date.now() - 1000);
    await userStore.upsert({ email: 'test@example.com' });

    const lastUpdate = await readModel.getLastUpdatedAt();
    expect(lastUpdate).toBeDefined();
    expect(lastUpdate!.lastUpdatedAt).toBeInstanceOf(Date);
    // check that it's recent
    expect(lastUpdate!.lastUpdatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeInsert.getTime(),
    );

    const users = await readModel.getUsersUpdatedAfterOrEqual(beforeInsert, 10);
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('test@example.com');
    expect(users[0].createdAt).toBeInstanceOf(Date);
    expect(users[0].updatedAt).toBeInstanceOf(Date);
    expect(users[0].deletedAt).toBeNull();
});

test('Modifying a user should return that user', async () => {
    const db = await dbInit();
    const stores = db.stores;
    const readModel = stores.userUpdatesReadModel;
    const userStore = stores.userStore;
    const inserted = await userStore.upsert({
        email: 'test@example.com',
    });

    const afterInsert = new Date();
    const lastUpdate = await readModel.getLastUpdatedAt();
    expect(lastUpdate).toBeDefined();
    const lastUpdatedAt = lastUpdate!.lastUpdatedAt;
    expect(lastUpdatedAt).toBeInstanceOf(Date);

    const users = await readModel.getUsersUpdatedAfterOrEqual(
        afterInsert,
        10,
        inserted.id,
    );
    expect(users).toHaveLength(0);

    await userStore.update(inserted.id, { name: 'New Name' });

    const lastUpdate2 = await readModel.getLastUpdatedAt();
    expect(lastUpdate2).toBeDefined();
    const lastUpdatedAt2 = lastUpdate2!.lastUpdatedAt;
    expect(lastUpdatedAt2).toBeInstanceOf(Date);
    expect(lastUpdatedAt2!.getTime()).toBeGreaterThanOrEqual(
        lastUpdatedAt!.getTime(),
    );

    const users2 = await readModel.getUsersUpdatedAfterOrEqual(
        afterInsert,
        10,
        inserted.id,
    );
    expect(users2).toHaveLength(1);
    expect(users2[0].email).toBe('test@example.com');
    expect(users2[0].name).toBe('New Name');
    expect(users2[0].createdAt).toBeInstanceOf(Date);
    expect(users2[0].updatedAt).toBeInstanceOf(Date);
    expect(users2[0].deletedAt).toBeNull();
});

test('Deleting a user should return that user', async () => {
    const db = await dbInit();
    const stores = db.stores;
    const readModel = stores.userUpdatesReadModel;
    const userStore = stores.userStore;
    const inserted = await userStore.upsert({
        email: 'test@example.com',
    });

    const afterInsert = new Date();
    const lastUpdate = await readModel.getLastUpdatedAt();
    expect(lastUpdate).toBeDefined();
    const lastUpdatedAt = lastUpdate!.lastUpdatedAt;
    expect(lastUpdatedAt).toBeInstanceOf(Date);

    const users = await readModel.getUsersUpdatedAfterOrEqual(
        afterInsert,
        10,
        inserted.id,
    );
    expect(users).toHaveLength(0);

    await userStore.delete(inserted.id);

    const lastUpdate2 = await readModel.getLastUpdatedAt();
    expect(lastUpdate2).toBeDefined();
    const lastUpdatedAt2 = lastUpdate2!.lastUpdatedAt;
    expect(lastUpdatedAt2).toBeInstanceOf(Date);
    expect(lastUpdatedAt2!.getTime()).toBeGreaterThanOrEqual(
        lastUpdatedAt!.getTime(),
    );

    const users2 = await readModel.getUsersUpdatedAfterOrEqual(
        afterInsert,
        10,
        inserted.id,
    );
    expect(users2).toHaveLength(1);
    expect(users2[0].email).toBeNull(); // currently we nullify the email but this might change in the future
    expect(users2[0].createdAt).toBeInstanceOf(Date);
    expect(users2[0].updatedAt).toBeInstanceOf(Date);
    expect(users2[0].deletedAt).toBeInstanceOf(Date);
});
