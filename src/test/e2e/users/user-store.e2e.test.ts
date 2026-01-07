import NotFoundError from '../../../lib/error/notfound-error.js';
import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import type { IUnleashStores } from '../../../lib/types/index.js';
import { beforeAll, afterAll, beforeEach, test, expect } from 'vitest';
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

beforeEach(async () => {
    await stores.userStore.deleteAll();
});

test('should have no users', async () => {
    const users = await stores.userStore.getAll();
    expect(users).toEqual([]);
});

test('should insert new user with email', async () => {
    const user = { email: 'me2@mail.com' };
    await stores.userStore.upsert(user);
    const users = await stores.userStore.getAll();
    expect(users[0].email).toEqual(user.email);
    expect(users[0].id).toBeTruthy();
});

test('should not allow two users with same email', async () => {
    await expect(async () => {
        await stores.userStore.insert({ email: 'me2@mail.com' });
        await stores.userStore.insert({ email: 'me2@mail.com' });
    }).rejects.toThrowError(/duplicate key value violates unique constraint/);
});

test('should insert new user with email and return it', async () => {
    const user = { email: 'me2@mail.com' };
    const newUser = await stores.userStore.upsert(user);
    expect(newUser.email).toEqual(user.email);
    expect(newUser.id).toBeTruthy();
});

test('should insert new user with username', async () => {
    const user = { username: 'admin' };
    await stores.userStore.upsert(user);
    const dbUser = await stores.userStore.getByQuery(user);
    expect(dbUser.username).toEqual(user.username);
});

test('Should require email or username', async () => {
    await expect(async () => {
        await stores.userStore.upsert({});
    }).rejects.toThrowError(
        new Error('Can only find users with id, username or email.'),
    );
});

test('should set password_hash for user', async () => {
    const store = stores.userStore;
    const user = await store.insert({ email: 'admin@mail.com' });
    await store.setPasswordHash(user.id, 'rubbish', 5);
    const hash = await store.getPasswordHash(user.id);

    expect(hash).toBe('rubbish');
});

test('should not get password_hash for unknown userId', async () => {
    const store = stores.userStore;
    await expect(async () =>
        store.getPasswordHash(-12),
    ).rejects.errorWithMessage(new NotFoundError('User not found'));
});

test('should update loginAttempts for user', async () => {
    const store = stores.userStore;
    const user = { email: 'admin@mail.com' };
    const updated_user = await store.upsert(user);
    await store.incLoginAttempts(updated_user);
    await store.incLoginAttempts(updated_user);
    const storedUser = await store.getByQuery(user);

    expect(storedUser.loginAttempts).toBe(2);
});

test('should not increment for user unknown user', async () => {
    const store = stores.userStore;
    const user = { email: 'another@mail.com' };
    await store.upsert(user);
    // @ts-expect-error - Should just use email here
    await store.incLoginAttempts({ email: 'unknown@mail.com' });
    const storedUser = await store.getByQuery(user);

    expect(storedUser.loginAttempts).toBe(0);
});

test('should reset user after successful login', async () => {
    const store = stores.userStore;
    const user = await store.insert({ email: 'anotherWithResert@mail.com' });
    await store.incLoginAttempts(user);
    await store.incLoginAttempts(user);

    await store.successfullyLogin(user);
    const storedUser = await store.getByQuery(user);

    expect(storedUser.loginAttempts).toBe(0);
    expect(storedUser.seenAt! >= user.seenAt!).toBe(true);
});

test('should return first login order for every new user', async () => {
    const store = stores.userStore;
    const user1 = await store.insert({ email: 'user1@mail.com' });
    const user2 = await store.insert({ email: 'user2@mail.com' });
    const user3 = await store.insert({ email: 'user3@mail.com' });

    expect(await store.successfullyLogin(user1)).toBe(0);
    expect(await store.successfullyLogin(user1)).toBe(0);
    expect(await store.successfullyLogin(user2)).toBe(1);
    expect(await store.successfullyLogin(user1)).toBe(0);
    expect(await store.successfullyLogin(user3)).toBe(2);
});

test('should only update specified fields on user', async () => {
    const store = stores.userStore;
    const email = 'usertobeupdated@mail.com';
    const user = {
        email,
        username: 'test',
    };

    await store.upsert(user);

    await store.upsert({ username: 'test' });

    const storedUser = await store.getByQuery({ email });

    expect(storedUser.email).toEqual(user.email);
    expect(storedUser.username).toEqual(user.username);
});

test('should always lowercase emails on inserts', async () => {
    const store = stores.userStore;
    const email = 'someCrazyCasingGoingOn@mail.com';
    const user = {
        email,
    };

    await store.upsert(user);

    const storedUser = await store.getByQuery({ email });

    expect(storedUser.email).toEqual(user.email.toLowerCase());
});

test('should always lowercase emails on updates', async () => {
    const store = stores.userStore;
    const email = 'someCrazyCasingGoingOn@mail.com';
    const user = {
        email,
    };

    await store.upsert(user);

    const storedUser = await store.getByQuery({ email });

    expect(storedUser.email).toEqual(user.email.toLowerCase());

    const updatedUser = {
        id: storedUser.id,
        email: 'SomeOtherCasing@hotmail.com',
    };
    await store.upsert(updatedUser);

    const newFromStore = await store.get(storedUser.id);
    expect(newFromStore).toBeDefined();
    expect(newFromStore!.email).toBe(updatedUser.email.toLowerCase());
});

test('should delete user', async () => {
    const user = await stores.userStore.upsert({
        email: 'deleteuser@mail.com',
    });

    await stores.userStore.delete(user.id);

    await expect(() => stores.userStore.get(user.id)).rejects.errorWithMessage(
        new NotFoundError('No user found'),
    );

    const deletedCount = await stores.userStore.countRecentlyDeleted();
    expect(deletedCount).toBe(1);
});
