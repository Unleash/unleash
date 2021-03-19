'use strict';

const test = require('ava');
const User = require('../../../lib/user');
const {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} = require('../../../lib/permissions');
const NotFoundError = require('../../../lib/error/notfound-error');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');

let stores;
let db;

test.before(async () => {
    db = await dbInit('user_store_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await db.destroy();
});

test.serial('should have no users', async t => {
    const users = await stores.userStore.getAll();
    t.deepEqual(users, []);
});

test.serial('should insert new user with email', async t => {
    const user = new User({ email: 'me2@mail.com' });
    await stores.userStore.upsert(user);
    const users = await stores.userStore.getAll();
    t.deepEqual(users[0].email, user.email);
    t.truthy(users[0].id);
});

test.serial('should not allow two users with same email', async t => {
    const error = await t.throwsAsync(
        async () => {
            await stores.userStore.insert({ email: 'me2@mail.com' });
            await stores.userStore.insert({ email: 'me2@mail.com' });
        },
        { instanceOf: Error },
    );

    t.true(
        error.message.includes(
            'duplicate key value violates unique constraint',
        ),
    );
});

test.serial('should insert new user with email and return it', async t => {
    const user = new User({ email: 'me2@mail.com' });
    const newUser = await stores.userStore.upsert(user);
    t.deepEqual(newUser.email, user.email);
    t.truthy(newUser.id);
});

test.serial('should insert new user with username', async t => {
    const user = new User({ username: 'admin' });
    await stores.userStore.upsert(user);
    const dbUser = await stores.userStore.get(user);
    t.deepEqual(dbUser.username, user.username);
});

test('Should require email or username', async t => {
    const error = await t.throwsAsync(
        async () => {
            await stores.userStore.upsert({});
        },
        { instanceOf: Error },
    );

    t.is(error.message, 'Can only find users with id, username or email.');
});

test.serial('should set password_hash for user', async t => {
    const store = stores.userStore;
    const user = await store.insert(new User({ email: 'admin@mail.com' }));
    await store.setPasswordHash(user.id, 'rubbish');
    const hash = await store.getPasswordHash(user.id);

    t.is(hash, 'rubbish');
});

test.serial('should not get password_hash for unknown userId', async t => {
    const store = stores.userStore;
    const error = await t.throwsAsync(
        async () => {
            await store.getPasswordHash(-12);
        },
        { instanceOf: NotFoundError },
    );

    t.is(error.message, 'User not found');
});

test.serial('should update loginAttempts for user', async t => {
    const store = stores.userStore;
    const user = new User({ email: 'admin@mail.com' });
    await store.upsert(user);
    await store.incLoginAttempts(user);
    await store.incLoginAttempts(user);
    const storedUser = await store.get(user);

    t.is(storedUser.loginAttempts, 2);
});

test.serial('should not increment for user unknwn user', async t => {
    const store = stores.userStore;
    const user = new User({ email: 'another@mail.com' });
    await store.upsert(user);
    await store.incLoginAttempts(new User({ email: 'unknown@mail.com' }));
    const storedUser = await store.get(user);

    t.is(storedUser.loginAttempts, 0);
});

test.serial('should reset user after successful login', async t => {
    const store = stores.userStore;
    const user = await store.insert(
        new User({ email: 'anotherWithResert@mail.com' }),
    );
    await store.incLoginAttempts(user);
    await store.incLoginAttempts(user);

    await store.succesfullLogin(user);
    const storedUser = await store.get(user);

    t.is(storedUser.loginAttempts, 0);
    t.true(storedUser.seenAt >= user.seenAt);
});

test.serial('should store and get permsissions', async t => {
    const store = stores.userStore;
    const email = 'userWithPermissions@mail.com';
    const user = new User({
        email,
        permissions: [CREATE_FEATURE, UPDATE_FEATURE, DELETE_FEATURE],
    });

    await store.upsert(user);

    const storedUser = await store.get({ email });

    t.deepEqual(storedUser.permissions, user.permissions);
});

test.serial('should only update specified fields on user', async t => {
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

    t.deepEqual(storedUser.email, user.email);
    t.deepEqual(storedUser.username, user.username);
    t.deepEqual(storedUser.permissions, [CREATE_FEATURE]);
});
