'use strict';

const User = require('../../../lib/user');
const {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} = require('../../../lib/permissions');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');
const NotFoundError = require('../../../lib/error/notfound-error');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('user_store_serial', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    stores.userStore.deleteAll();
});

test('should have no users', async () => {
    const users = await stores.userStore.getAll();
    expect(users).toEqual([]);
});

test('should insert new user with email', async () => {
    const user = new User({ email: 'me2@mail.com' });
    await stores.userStore.upsert(user);
    const users = await stores.userStore.getAll();
    expect(users[0].email).toEqual(user.email);
    expect(users[0].id).toBeTruthy();
});

test('should not allow two users with same email', async () => {
    await expect(async () => {
        await stores.userStore.insert({ email: 'me2@mail.com' });
        await stores.userStore.insert({ email: 'me2@mail.com' });
    }).rejects.toThrow(/duplicate key value violates unique constraint/);
});

test('should insert new user with email and return it', async () => {
    const user = new User({ email: 'me2@mail.com' });
    const newUser = await stores.userStore.upsert(user);
    expect(newUser.email).toEqual(user.email);
    expect(newUser.id).toBeTruthy();
});

test('should insert new user with username', async () => {
    const user = new User({ username: 'admin' });
    await stores.userStore.upsert(user);
    const dbUser = await stores.userStore.get(user);
    expect(dbUser.username).toEqual(user.username);
});

test('Should require email or username', async () => {
    expect.assertions(1);
    try {
        await stores.userStore.upsert({});
    } catch (e) {
        expect(e).toStrictEqual(new TypeError('Username or Email is required'));
    }
});

test('should set password_hash for user', async () => {
    const store = stores.userStore;
    const user = await store.insert(new User({ email: 'admin@mail.com' }));
    await store.setPasswordHash(user.id, 'rubbish');
    const hash = await store.getPasswordHash(user.id);

    expect(hash).toBe('rubbish');
});

test('should not get password_hash for unknown userId', async () => {
    const store = stores.userStore;
    await expect(async () => {
        await store.getPasswordHash(-12);
    }).rejects.toStrictEqual(new NotFoundError('User not found'));
});

test('should update loginAttempts for user', async () => {
    const store = stores.userStore;
    const user = new User({ email: 'admin@mail.com' });
    await store.upsert(user);
    await store.incLoginAttempts(user);
    await store.incLoginAttempts(user);
    const storedUser = await store.get(user);

    expect(storedUser.loginAttempts).toBe(2);
});

test('should not increment for user unknwn user', async () => {
    const store = stores.userStore;
    const user = new User({ email: 'another@mail.com' });
    await store.upsert(user);
    await store.incLoginAttempts(new User({ email: 'unknown@mail.com' }));
    const storedUser = await store.get(user);

    expect(storedUser.loginAttempts).toBe(0);
});

test('should reset user after successful login', async () => {
    const store = stores.userStore;
    const user = await store.insert(
        new User({ email: 'anotherWithResert@mail.com' }),
    );
    await store.incLoginAttempts(user);
    await store.incLoginAttempts(user);

    await store.successfullyLogin(user);
    const storedUser = await store.get(user);

    expect(storedUser.loginAttempts).toBe(0);
    expect(storedUser.seenAt >= user.seenAt).toBe(true);
});

test('should store and get permissions', async () => {
    const store = stores.userStore;
    const email = 'userWithPermissions@mail.com';
    const user = new User({
        email,
        permissions: [CREATE_FEATURE, UPDATE_FEATURE, DELETE_FEATURE],
    });

    await store.upsert(user);

    const storedUser = await store.get({ email });

    expect(storedUser.permissions).toEqual(user.permissions);
});

test('should only update specified fields on user', async () => {
    const store = stores.userStore;
    const email = 'userTobeUpdated@mail.com';
    const user = new User({
        email,
        username: 'test',
        permissions: [CREATE_FEATURE, UPDATE_FEATURE, DELETE_FEATURE],
    });

    await store.upsert(user);

    await store.upsert({ username: 'test', permissions: [CREATE_FEATURE] });

    const storedUser = await store.get({ email });

    expect(storedUser.email).toEqual(user.email);
    expect(storedUser.username).toEqual(user.username);
    expect(storedUser.permissions).toEqual([CREATE_FEATURE]);
});
