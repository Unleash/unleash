import NotFoundError from '../../../lib/error/notfound-error';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('user_store_serial', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    await db.destroy();
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
    }).rejects.toThrow(/duplicate key value violates unique constraint/);
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
    }).rejects.toThrow(
        new Error('Can only find users with id, username or email.'),
    );
});

test('should set password_hash for user', async () => {
    const store = stores.userStore;
    const user = await store.insert({ email: 'admin@mail.com' });
    await store.setPasswordHash(user.id, 'rubbish');
    const hash = await store.getPasswordHash(user.id);

    expect(hash).toBe('rubbish');
});

test('should not get password_hash for unknown userId', async () => {
    const store = stores.userStore;
    await expect(async () => store.getPasswordHash(-12)).rejects.toThrow(
        new NotFoundError('User not found'),
    );
});

test('should update loginAttempts for user', async () => {
    const store = stores.userStore;
    const user = { email: 'admin@mail.com' };
    await store.upsert(user);
    await store.incLoginAttempts(user);
    await store.incLoginAttempts(user);
    const storedUser = await store.getByQuery(user);

    expect(storedUser.loginAttempts).toBe(2);
});

test('should not increment for user unknown user', async () => {
    const store = stores.userStore;
    const user = { email: 'another@mail.com' };
    await store.upsert(user);
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
    expect(storedUser.seenAt >= user.seenAt).toBe(true);
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

    let storedUser = await store.getByQuery({ email });

    expect(storedUser.email).toEqual(user.email.toLowerCase());

    const updatedUser = {
        id: storedUser.id,
        email: 'SomeOtherCasing@hotmail.com',
    };
    await store.upsert(updatedUser);

    storedUser = await store.get(storedUser.id);
    expect(storedUser.email).toBe(updatedUser.email.toLowerCase());
});
