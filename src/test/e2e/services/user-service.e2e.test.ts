import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import UserService from '../../../lib/services/user-service';
import { AccessService } from '../../../lib/services/access-service';
import UserStore from '../../../lib/db/user-store';
import ResetTokenService from '../../../lib/services/reset-token-service';
import { EmailService } from '../../../lib/services/email-service';
import { createTestConfig } from '../../config/test-config';
import SessionService from '../../../lib/services/session-service';
import NotFoundError from '../../../lib/error/notfound-error';
import { IRole } from '../../../lib/types/stores/access-store';
import { RoleName } from '../../../lib/types/model';

let db;
let stores;
let userService: UserService;
let userStore: UserStore;
let adminRole: IRole;
let sessionService: SessionService;

beforeAll(async () => {
    db = await dbInit('user_service_serial', getLogger);
    stores = db.stores;
    const config = createTestConfig();
    const accessService = new AccessService(stores, config);
    const resetTokenService = new ResetTokenService(stores, config);
    const emailService = new EmailService(undefined, config.getLogger);
    sessionService = new SessionService(stores, config);

    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
    });
    userStore = stores.userStore;
    const rootRoles = await accessService.getRootRoles();
    adminRole = rootRoles.find((r) => r.name === RoleName.ADMIN);
});

afterAll(async () => {
    await db.destroy();
});

afterEach(async () => {
    await userStore.deleteAll();
});

test('should create initial admin user', async () => {
    await userService.initAdminUser();
    await expect(async () =>
        userService.loginUser('admin', 'wrong-password'),
    ).rejects.toThrow(Error);
    await expect(async () =>
        userService.loginUser('admin', 'unleash4all'),
    ).toBeTruthy();
});

test('should not be allowed to create existing user', async () => {
    await userStore.insert({ username: 'test', name: 'Hans Mola' });
    await expect(async () =>
        userService.createUser({ username: 'test', rootRole: adminRole.id }),
    ).rejects.toThrow(Error);
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

test('should get user with root role by name', async () => {
    const email = 'some2@test.com';
    const u = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: RoleName.ADMIN,
    });
    const user = await userService.getUser(u.id);
    expect(user.email).toBe(email);
    expect(user.id).toBe(u.id);
    expect(user.rootRole).toBe(adminRole.id);
});

test("deleting a user should delete the user's sessions", async () => {
    const email = 'some@test.com';
    const user = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: adminRole.id,
    });
    const testComSession = {
        sid: 'xyz321',
        sess: {
            cookie: {
                originalMaxAge: 2880000,
                expires: new Date(Date.now() + 86400000).toDateString(),
                secure: false,
                httpOnly: true,
                path: '/',
            },
            user,
        },
    };
    await sessionService.insertSession(testComSession);
    const userSessions = await sessionService.getSessionsForUser(user.id);
    expect(userSessions.length).toBe(1);
    await userService.deleteUser(user.id);
    await expect(async () =>
        sessionService.getSessionsForUser(user.id),
    ).rejects.toThrow(NotFoundError);
});
