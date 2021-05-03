import test from 'ava';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import UserService from '../../../lib/services/user-service';
import { AccessService, RoleName } from '../../../lib/services/access-service';
import UserStore from '../../../lib/db/user-store';
import User from '../../../lib/types/user';
import { IRole } from '../../../lib/db/access-store';
import ResetTokenService from '../../../lib/services/reset-token-service';
import { EmailService } from '../../../lib/services/email-service';
import { createTestConfig } from '../../config/test-config';
import SessionService from '../../../lib/services/session-service';
import NotFoundError from '../../../lib/error/notfound-error';

let db;
let stores;
let userService: UserService;
let userStore: UserStore;
let adminRole: IRole;
let sessionService: SessionService;

test.before(async () => {
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
    adminRole = rootRoles.find(r => r.name === RoleName.ADMIN);
});

test.after(async () => {
    await db.destroy();
});

test.afterEach(async () => {
    await userStore.deleteAll();
});

test.serial('should create initial admin user', async t => {
    await userService.initAdminUser();
    await t.notThrowsAsync(userService.loginUser('admin', 'unleash4all'));
    await t.throwsAsync(userService.loginUser('admin', 'wrong-password'));
});

test.serial('should not be allowed to create existing user', async t => {
    await userStore.insert({ username: 'test', name: 'Hans Mola' });
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

test.serial('should get user with root role by name', async t => {
    const email = 'some2@test.com';
    const u = await userService.createUser({
        email,
        password: 'A very strange P4ssw0rd_',
        rootRole: RoleName.ADMIN,
    });
    const user = await userService.getUser(u.id);
    t.is(user.email, email);
    t.is(user.id, u.id);
    t.is(user.rootRole, adminRole.id);
});

test.serial(`deleting a user should delete the user's sessions`, async t => {
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
    t.is(userSessions.length, 1);
    await userService.deleteUser(user.id);
    await t.throwsAsync(
        async () => sessionService.getSessionsForUser(user.id),
        {
            instanceOf: NotFoundError,
        },
    );
});
