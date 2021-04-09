import test from 'ava';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import UserService from '../../../lib/services/user-service';
import { AccessService, RoleName } from '../../../lib/services/access-service';
import UserStore from '../../../lib/db/user-store';
import User from '../../../lib/user';
import { IUnleashConfig } from '../../../lib/types/core';
import { IRole } from '../../../lib/db/access-store';
import ResetTokenService from '../../../lib/services/reset-token-service';

let db;
let stores;
let userService: UserService;
let userStore: UserStore;
let adminRole: IRole;

test.before(async () => {
    db = await dbInit('user_service_serial', getLogger);
    stores = db.stores;
    const config: IUnleashConfig = {
        getLogger,
        baseUriPath: '/test',
        authentication: {
            enableApiToken: false,
            createAdminUser: false,
        },
    };
    const accessService = new AccessService(stores, config);
    const resetTokenService = new ResetTokenService(stores, config);
    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
    });
    userStore = stores.userStore;
    const rootRoles = await accessService.getRootRoles();
    adminRole = rootRoles.find(r => r.name === RoleName.ADMIN);
});

test.after(async () => {
    await db.destroy();
});

test.afterEach(async () => {
    const users = await userStore.getAll();
    const deleteAll = users.map((u: User) => userStore.delete(u.id));
    await Promise.all(deleteAll);
});

test.serial('should create initial admin user', async t => {
    await userService.initAdminUser();
    await t.notThrowsAsync(userService.loginUser('admin', 'admin'));
    await t.throwsAsync(userService.loginUser('admin', 'wrong-password'));
});

test.serial('should not be allowed to create existing user', async t => {
    await userStore.insert(new User({ username: 'test', name: 'Hans Mola' }));
    await t.throwsAsync(
        userService.createUser({ username: 'test', rootRole: adminRole.id }),
    );
});

test.serial('should create user with password', async t => {
    await userService.createUser({
        username: 'test',
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    });
    const user = await userService.loginUser(
        'test',
        'A very strange P4ssw0rd_',
    );
    t.is(user.username, 'test');
});

test.serial('should login for user _without_ password', async t => {
    const email = 'some@test.com';
    await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    });
    const user = await userService.loginUserWithoutPassword(email);
    t.is(user.email, email);
});

test.serial('should get user with root role', async t => {
    const email = 'some@test.com';
    const u = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    });
    const user = await userService.getUser(u.id);
    t.is(user.email, email);
    t.is(user.id, u.id);
    t.is(user.rootRole, adminRole.id);
});
