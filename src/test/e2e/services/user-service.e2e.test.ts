import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import UserService from '../../../lib/services/user-service';
import { AccessService, RoleName } from '../../../lib/services/access-service';
import UserStore from '../../../lib/db/user-store';
import User from '../../../lib/user';
import { IRole } from '../../../lib/db/access-store';
import ResetTokenService from '../../../lib/services/reset-token-service';
import { EmailService } from '../../../lib/services/email-service';
import { createTestConfig } from '../../config/test-config';

let db;
let stores;
let userService: UserService;
let userStore: UserStore;
let adminRole: IRole;

beforeAll(async () => {
    db = await dbInit('user_service_serial', getLogger);
    stores = db.stores;
    const config = createTestConfig();
    const accessService = new AccessService(stores, config);
    const resetTokenService = new ResetTokenService(stores, config);
    const emailService = new EmailService(undefined, config.getLogger);

    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
    });
    userStore = stores.userStore;
    const rootRoles = await accessService.getRootRoles();
    adminRole = rootRoles.find(r => r.name === RoleName.ADMIN);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
afterEach(async () => {
    const users = await userStore.getAll();
    const deleteAll = users.map((u: User) => userStore.delete(u.id));
    await Promise.all(deleteAll);
});

test('should create initial admin user', async () => {
    expect.assertions(2);
    await userService.initAdminUser();
    const user = await userService.loginUser('admin', 'admin');
    expect(user).toBeDefined();
    try {
        const user = await userService.loginUser('admin', 'wrong-password');
    } catch (e) {
        expect(e).toBeDefined();
    }
});

test('should not be allowed to create existing user', async () => {
    await userStore.insert(new User({ username: 'test', name: 'Hans Mola' }));
    expect.assertions(1);
    try {
        await userService.createUser({
            username: 'test',
            rootRole: adminRole.id,
        });
    } catch (e) {
        expect(e).toBeDefined();
    }
});

test('should create user with password', async () => {
    await userService.createUser({
        username: 'test',
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    });
    const user = await userService.loginUser(
        'test',
        'A very strange P4ssw0rd_',
    );
    expect(user.username).toBe('test');
});

test('should login for user _without_ password', async () => {
    const email = 'some@test.com';
    await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    });
    const user = await userService.loginUserWithoutPassword(email);
    expect(user.email).toBe(email);
});

test('should get user with root role', async () => {
    const email = 'some@test.com';
    const u = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    });
    const user = await userService.getUser(u.id);
    expect(user.email).toBe(email);
    expect(user.id).toBe(u.id);
    expect(user.rootRole).toBe(adminRole.id);
});
