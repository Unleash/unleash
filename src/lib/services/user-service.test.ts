import test from 'ava';
import UserService from './user-service';
import UserStoreMock from '../../test/fixtures/fake-user-store';
import AccessServiceMock from '../../test/fixtures/access-service-mock';
import noLogger from '../../test/fixtures/no-logger';
import { RoleName } from './access-service';
import { IUnleashConfig } from '../types/core';

const config: IUnleashConfig = {
    getLogger: noLogger,
    baseUriPath: '',
    authentication: { enableApiToken: true, createAdminUser: false },
};

test('Should create new user', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService({ userStore }, config, accessService);
    const user = await service.createUser({
        username: 'test',
        rootRole: RoleName.ADMIN,
    });
    const storedUser = await userStore.get(user);
    const allUsers = await userStore.getAll();

    t.truthy(user.id);
    t.is(user.username, 'test');
    t.is(allUsers.length, 1);
    t.is(storedUser.username, 'test');
    // t.truthy(storedUser.passwordHash);
});

/*
test('Should delete user', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService(
        { userStore, getLogger, accessService },
        false,
    );
    const user = await service.createUser({
        username: 'test',
        password: 'somePassWithManyChars',
        permissions: ['ADMIN'],
    });
    await service.deleteUser(user.id);
    const hasUser = userStore.hasUser(user.id);
    t.falsy(hasUser);
});

test('Should login user', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService(
        { userStore, getLogger, accessService },
        false,
    );
    await service.createUser({
        username: 'test',
        password: 'somePassWithManyChars',
        permissions: ['ADMIN'],
    });
    const user = await service.loginUser('test', 'somePassWithManyChars');
    t.is(user.username, 'test');
});

test('Should update password for user', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService({ userStore }, config, accessService);

    const u = await service.createUser({
        username: 'test',
        password: 'somePassWithManyChars2_',
        permissions: ['ADMIN'],
    });
    await service.changePassword(u.id, 'newpassword2_sDAS');
    const user = await service.loginUser('test', 'newpassword2_sDAS');
    t.is(user.username, 'test');
});

test('Should create default user', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService({ userStore }, config, accessService);

    await service.initDefaultUser();

    const user = await service.loginUser('admin', 'admin');
    t.is(user.username, 'admin');
});

test('Should be a valid password', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService({ userStore }, config, accessService);

    const valid = service.validatePassword('this is a strong password!');

    t.true(valid);
});

test('Password must be at least 10 chars', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService({ userStore }, config, accessService);

    t.throws(() => service.validatePassword('admin'), {
        message: 'The password must be at least 10 characters long.',
    });
});

test('The password must contain at least one uppercase letter.', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService({ userStore }, config, accessService);

    t.throws(() => service.validatePassword('qwertyabcde'), {
        message: 'The password must contain at least one uppercase letter.',
    });
});

test('The password must contain at least one number', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService({ userStore }, config, accessService);

    t.throws(() => service.validatePassword('qwertyabcdE'), {
        message: 'The password must contain at least one number.',
    });
});

test('The password must contain at least one special character', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService({ userStore }, config, accessService);

    t.throws(() => service.validatePassword('qwertyabcdE2'), {
        message: 'The password must contain at least one special character.',
    });
});

test('Should be a valid password with special chars', async t => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const service = new UserService({ userStore }, config, accessService);

    const valid = service.validatePassword('this is a strong password!');

    t.true(valid);
});

*/
