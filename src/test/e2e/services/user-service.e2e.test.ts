import test from 'ava';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import UserService from '../../../lib/services/user-service';
import { AccessService, RoleName } from '../../../lib/services/access-service';
import UserStore from '../../../lib/db/user-store';
import User from '../../../lib/user';
import { IUnleashConfig } from '../../../lib/types/core';

let db;
let stores;
let userService: UserService;
let userStore: UserStore;

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
    userService = new UserService(stores, config, accessService);
    userStore = stores.userStore;
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
        userService.createUser({ username: 'test', rootRole: RoleName.ADMIN }),
    );
});

test.serial('should create user with password', async t => {
    await userService.createUser({
        username: 'test',
        password: 'A very strange P4ssw0rd_',
        rootRole: RoleName.ADMIN,
    });
    const user = await userService.loginUser(
        'test',
        'A very strange P4ssw0rd_',
    );
    t.is(user.username, 'test');
});
