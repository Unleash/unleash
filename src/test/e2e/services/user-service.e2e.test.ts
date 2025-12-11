import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import UserService from '../../../lib/services/user-service.js';
import { AccessService } from '../../../lib/services/access-service.js';
import ResetTokenService from '../../../lib/services/reset-token-service.js';
import { EmailService } from '../../../lib/services/email-service.js';
import { createTestConfig } from '../../config/test-config.js';
import SessionService from '../../../lib/services/session-service.js';
import NotFoundError from '../../../lib/error/notfound-error.js';
import type { IRole } from '../../../lib/types/stores/access-store.js';
import { RoleName } from '../../../lib/types/model.js';
import SettingService from '../../../lib/services/setting-service.js';
import { simpleAuthSettingsKey } from '../../../lib/types/settings/simple-auth-settings.js';
import { addDays, minutesToMilliseconds } from 'date-fns';
import { GroupService } from '../../../lib/services/group-service.js';
import { BadDataError } from '../../../lib/error/index.js';
import PasswordMismatch from '../../../lib/error/password-mismatch.js';
import type { EventService } from '../../../lib/services/index.js';
import {
    CREATE_ADDON,
    type IUnleashStores,
    type IUserStore,
    SYSTEM_USER_AUDIT,
    TEST_AUDIT_USER,
} from '../../../lib/types/index.js';
import {
    USER_CREATED,
    USER_DELETED,
    USER_UPDATED,
} from '../../../lib/events/index.js';
import { CUSTOM_ROOT_ROLE_TYPE } from '../../../lib/util/index.js';
import { PasswordPreviouslyUsedError } from '../../../lib/error/password-previously-used.js';
import { createEventsService } from '../../../lib/features/index.js';
import type EventEmitter from 'events';
import { USER_LOGIN } from '../../../lib/metric-events.js';
import {
    beforeAll,
    afterAll,
    beforeEach,
    test,
    describe,
    expect,
} from 'vitest';
let db: ITestDb;
let stores: IUnleashStores;
let userService: UserService;
let userStore: IUserStore;
let adminRole: IRole;
let viewerRole: IRole;
let customRole: IRole;
let sessionService: SessionService;
let settingService: SettingService;
let eventService: EventService;
let accessService: AccessService;
let eventBus: EventEmitter;

const allowedSessions = 2;

beforeAll(async () => {
    db = await dbInit('user_service_serial', getLogger);
    stores = db.stores;
    const config = createTestConfig({
        session: { maxParallelSessions: allowedSessions },
    });
    eventBus = config.eventBus;
    eventService = createEventsService(db.rawDatabase, config);
    const groupService = new GroupService(stores, config, eventService);
    accessService = new AccessService(
        stores,
        config,
        groupService,
        eventService,
    );
    const resetTokenService = new ResetTokenService(stores, config);
    const emailService = new EmailService(config);
    sessionService = new SessionService(stores, config);
    settingService = new SettingService(stores, config, eventService);

    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    userStore = stores.userStore;
    const rootRoles = await accessService.getRootRoles();
    adminRole = rootRoles.find((r) => r.name === RoleName.ADMIN)!;
    viewerRole = rootRoles.find((r) => r.name === RoleName.VIEWER)!;
    customRole = await accessService.createRole(
        {
            name: 'Custom role',
            type: CUSTOM_ROOT_ROLE_TYPE,
            description: 'A custom role',
            permissions: [
                {
                    name: CREATE_ADDON,
                },
            ],
            createdByUserId: 1,
        },
        SYSTEM_USER_AUDIT,
    );
});

afterAll(async () => {
    await db.destroy();
});

beforeEach(async () => {
    await userStore.deleteAll();
    await settingService.deleteAll();
});

test('should create initial admin user', async () => {
    await userService.initAdminUser({
        createAdminUser: true,
    });
    await expect(async () =>
        userService.loginUser('admin', 'wrong-password'),
    ).rejects.toThrow(Error);
    await expect(async () =>
        userService.loginUser('admin', 'unleash4all'),
    ).toBeTruthy();
});

test('should not init default user if we already have users', async () => {
    await userService.createUser(
        {
            username: 'test',
            password: 'A very strange P4ssw0rd_',
            rootRole: adminRole.id,
        },
        SYSTEM_USER_AUDIT,
    );
    await userService.initAdminUser({
        createAdminUser: true,
    });
    const users = await userService.getAll();
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe('test');
    await expect(async () =>
        userService.loginUser('admin', 'unleash4all'),
    ).rejects.toThrow(Error);
});

test('should not be allowed to create existing user', async () => {
    await userStore.insert({ username: 'test', name: 'Hans Mola' });
    await expect(async () =>
        userService.createUser(
            { username: 'test', rootRole: adminRole.id },
            TEST_AUDIT_USER,
        ),
    ).rejects.toThrow(Error);
});

test('should create user with password', async () => {
    const recordedEvents: Array<{ loginOrder: number }> = [];
    eventBus.on(USER_LOGIN, (data) => {
        recordedEvents.push(data);
    });
    await userService.createUser(
        {
            username: 'test',
            password: 'A very strange P4ssw0rd_',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    );
    const user = await userService.loginUser(
        'test',
        'A very strange P4ssw0rd_',
    );
    expect(user.username).toBe('test');
    expect(recordedEvents).toEqual([{ loginOrder: 0 }]);
});

test('should create user with rootRole in audit-log', async () => {
    const user = await userService.createUser(
        {
            username: 'test',
            rootRole: viewerRole.id,
        },
        TEST_AUDIT_USER,
    );

    const { events } = await eventService.getEvents();
    expect(events[0].type).toBe(USER_CREATED);
    expect(events[0].data.id).toBe(user.id);
    expect(events[0].data.username).toBe('test');
    expect(events[0].data.rootRole).toBe(viewerRole.id);
});

test('should update user with rootRole in audit-log', async () => {
    const user = await userService.createUser(
        {
            username: 'test',
            rootRole: viewerRole.id,
        },
        TEST_AUDIT_USER,
    );

    await userService.updateUser(
        { id: user.id, rootRole: adminRole.id },
        TEST_AUDIT_USER,
    );

    const { events } = await eventService.getEvents();
    expect(events[0].type).toBe(USER_UPDATED);
    expect(events[0].data.id).toBe(user.id);
    expect(events[0].data.username).toBe('test');
    expect(events[0].data.rootRole).toBe(adminRole.id);
});

test('should remove user with rootRole in audit-log', async () => {
    const user = await userService.createUser(
        {
            username: 'test',
            rootRole: viewerRole.id,
        },
        TEST_AUDIT_USER,
    );

    await userService.deleteUser(user.id, TEST_AUDIT_USER);

    const { events } = await eventService.getEvents();
    expect(events[0].type).toBe(USER_DELETED);
    expect(events[0].preData.id).toBe(user.id);
    expect(events[0].preData.username).toBe('test');
    expect(events[0].preData.rootRole).toBe(viewerRole.id);
});

test('should not be able to login with deleted user', async () => {
    const user = await userService.createUser(
        {
            username: 'deleted_user',
            password: 'unleash4all',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    );

    await userService.deleteUser(user.id, TEST_AUDIT_USER);

    await expect(
        userService.loginUser('deleted_user', 'unleash4all'),
    ).rejects.errorWithMessage(
        new PasswordMismatch(
            'The combination of password and username you provided is invalid. If you have forgotten your password, visit /forgotten-password or get in touch with your instance administrator.',
        ),
    );
});

test('should not be able to login without password_hash on user', async () => {
    const user = await userService.createUser(
        {
            username: 'deleted_user',
            password: 'unleash4all',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    );

    /*@ts-expect-error: we are testing for null on purpose! */
    await userStore.setPasswordHash(user.id, null);

    await expect(
        userService.loginUser('deleted_user', 'anything-should-fail'),
    ).rejects.errorWithMessage(
        new PasswordMismatch(
            'The combination of password and username you provided is invalid. If you have forgotten your password, visit /forgotten-password or get in touch with your instance administrator.',
        ),
    );
});

test('should not login user if simple auth is disabled', async () => {
    await settingService.insert(
        simpleAuthSettingsKey,
        { disabled: true },
        TEST_AUDIT_USER,
        true,
    );

    await userService.createUser(
        {
            username: 'test_no_pass',
            password: 'A very strange P4ssw0rd_',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    );

    await expect(async () => {
        await userService.loginUser('test_no_pass', 'A very strange P4ssw0rd_');
    }).rejects.toThrowError(
        'Logging in with username/password has been disabled.',
    );
});

test('should login for user _without_ password', async () => {
    const email = 'some@test.com';
    await userService.createUser(
        {
            email,
            password: 'A very strange P4ssw0rd_',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    );
    const user = await userService.loginUserWithoutPassword(email);
    expect(user.email).toBe(email);
});

test('should get user with root role', async () => {
    const email = 'some@test.com';
    const u = await userService.createUser(
        {
            email,
            password: 'A very strange P4ssw0rd_',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    );
    const user = await userService.getUser(u.id);
    expect(user.email).toBe(email);
    expect(user.id).toBe(u.id);
    expect(user.rootRole).toBe(adminRole.id);
});

test('should get user with root role by name', async () => {
    const email = 'some2@test.com';
    const u = await userService.createUser(
        {
            email,
            password: 'A very strange P4ssw0rd_',
            rootRole: RoleName.ADMIN,
        },
        TEST_AUDIT_USER,
    );
    const user = await userService.getUser(u.id);
    expect(user.email).toBe(email);
    expect(user.id).toBe(u.id);
    expect(user.rootRole).toBe(adminRole.id);
});

test("deleting a user should delete the user's sessions", async () => {
    const email = 'some@test.com';
    const user = await userService.createUser(
        {
            email,
            password: 'A very strange P4ssw0rd_',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    );
    const testComSession = {
        sid: 'xyz321',
        sess: {
            cookie: {
                originalMaxAge: minutesToMilliseconds(48),
                expires: addDays(Date.now(), 1).toDateString(),
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
    await userService.deleteUser(user.id, TEST_AUDIT_USER);
    const noSessions = await sessionService.getSessionsForUser(user.id);
    expect(noSessions.length).toBe(0);
});

test('user login should remove stale sessions', async () => {
    const email = 'some@test.com';
    const user = await userService.createUser(
        {
            email,
            password: 'A very strange P4ssw0rd_',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    );
    const userSession = (index: number) => ({
        sid: `sid${index}`,
        sess: {
            cookie: {
                originalMaxAge: minutesToMilliseconds(48),
                expires: addDays(Date.now(), 1).toDateString(),
                secure: false,
                httpOnly: true,
                path: '/',
            },
            user,
        },
    });

    for (let i = 0; i < allowedSessions; i++) {
        await sessionService.insertSession(userSession(i));
    }

    const loggedInUser = await userService.loginUser(
        email,
        'A very strange P4ssw0rd_',
    );

    expect(loggedInUser.deletedSessions).toBe(1);
    expect(loggedInUser.activeSessions).toBe(allowedSessions);
});

test('updating a user without an email should not strip the email', async () => {
    const email = 'some@test.com';
    const user = await userService.createUser(
        {
            email,
            password: 'A very strange P4ssw0rd_',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    );

    await userService.updateUser(
        {
            id: user.id,
            name: 'some',
        },
        TEST_AUDIT_USER,
    );

    const updatedUser = await userService.getUser(user.id);
    expect(updatedUser.email).toBe(email);
});

describe('loginUserSSO', () => {
    test('should login and create user via SSO', async () => {
        const recordedEvents: Array<{ loginOrder: number }> = [];
        eventBus.on(USER_LOGIN, (data) => {
            recordedEvents.push(data);
        });
        const email = 'some@test.com';
        const user = await userService.loginUserSSO({
            email,
            rootRole: RoleName.VIEWER,
            name: 'some',
            autoCreate: true,
        });

        const userWithRole = await userService.getUser(user.id);
        expect(user.email).toBe(email);
        expect(user.name).toBe('some');
        expect(userWithRole.name).toBe('some');
        expect(userWithRole.rootRole).toBe(viewerRole.id);
        expect(recordedEvents).toEqual([{ loginOrder: 0 }]);
    });

    test('should throw if rootRole is wrong via SSO', async () => {
        expect.assertions(1);

        await expect(
            userService.loginUserSSO({
                email: 'some@test.com',
                rootRole: RoleName.MEMBER,
                name: 'some',
                autoCreate: true,
            }),
        ).rejects.errorWithMessage(
            new BadDataError('Could not find rootRole=Member'),
        );
    });

    test('should update user name when signing in via SSO', async () => {
        const email = 'some@test.com';
        const originalUser = await userService.createUser(
            {
                email,
                rootRole: RoleName.VIEWER,
                name: 'some',
            },
            TEST_AUDIT_USER,
        );

        await userService.loginUserSSO({
            email,
            rootRole: RoleName.ADMIN,
            name: 'New name!',
            autoCreate: true,
        });

        const actualUser = await userService.getUser(originalUser.id);

        expect(actualUser.email).toBe(email);
        expect(actualUser.name).toBe('New name!');
        expect(actualUser.rootRole).toBe(viewerRole.id);
        const { events } = await eventService.getEvents();
        const updateEvent = events.find(
            (e) => e.data.id === originalUser.id && e.data.name === 'New name!',
        );
        expect(updateEvent).toBeDefined();
    });

    test('should update name if it is different via SSO', async () => {
        const email = 'some@test.com';
        const originalUser = await userService.createUser(
            {
                email,
                rootRole: RoleName.VIEWER,
                name: 'some',
            },
            TEST_AUDIT_USER,
        );

        await userService.loginUserSSO({
            email,
            rootRole: RoleName.ADMIN,
            name: 'New name!',
            autoCreate: false,
        });

        const actualUser = await userService.getUser(originalUser.id);

        expect(actualUser.email).toBe(email);
        expect(actualUser.name).toBe('New name!');
        expect(actualUser.rootRole).toBe(viewerRole.id);
    });

    test('should throw if autoCreate is false via SSO', async () => {
        expect.assertions(1);

        await expect(
            userService.loginUserSSO({
                email: 'some@test.com',
                rootRole: RoleName.MEMBER,
                name: 'some',
                autoCreate: false,
            }),
        ).rejects.errorWithMessage(new NotFoundError('No user found'));
    });

    test('should support a root role id when logging in and creating user via SSO', async () => {
        const name = 'root-role-id';
        const email = `${name}@test.com`;
        const user = await userService.loginUserSSO({
            email,
            rootRole: viewerRole.id,
            name,
            autoCreate: true,
        });

        const userWithRole = await userService.getUser(user.id);
        expect(user.email).toBe(email);
        expect(user.name).toBe(name);
        expect(userWithRole.name).toBe(name);
        expect(userWithRole.rootRole).toBe(viewerRole.id);
    });

    test('should support a custom root role id when logging in and creating user via SSO', async () => {
        const name = 'custom-root-role-id';
        const email = `${name}@test.com`;
        const user = await userService.loginUserSSO({
            email,
            rootRole: customRole.id,
            name,
            autoCreate: true,
        });

        const userWithRole = await userService.getUser(user.id);
        expect(user.email).toBe(email);
        expect(user.name).toBe(name);
        expect(userWithRole.name).toBe(name);
        expect(userWithRole.rootRole).toBe(customRole.id);

        const permissions = await accessService.getPermissionsForUser(user);
        expect(permissions).toHaveLength(1);
        expect(permissions[0].permission).toBe(CREATE_ADDON);
    });

    test(`should not update the username if managed by SCIM`, async () => {
        const email = 'test-1@getunleash.io';
        const originalName = 'Original Name';
        const name = 'Updated Name';
        const createdUser = await userStore.insert({
            name: originalName,
            username: 'random-1234',
            email,
        });
        await db
            .rawDatabase('users')
            .update({
                scim_id: '123',
            })
            .where({ id: createdUser.id });

        const user = await userService.loginUserSSO({
            email,
            autoCreate: true,
            name,
        });

        expect(user.name).toBe(originalName);

        // Fetch the user directly from the store to verify
        const storedUser = await userStore.get(user.id);
        expect(storedUser!.name).toBe(originalName);
    });
});

describe('Should not be able to use any of previous 5 passwords', () => {
    test('throws exception when trying to use a previously used password', async () => {
        const name = 'same-password-is-not-allowed';
        const email = `${name}@test.com`;
        const password = 'externalScreaming$123';
        const user = await userService.createUser({
            email,
            rootRole: customRole.id,
            name,
            password,
        });
        await expect(
            userService.changePasswordWithPreviouslyUsedPasswordCheck(
                user.id,
                password,
            ),
        ).rejects.errorWithMessage(new PasswordPreviouslyUsedError());
    });
    test('Is still able to change password to one not used', async () => {
        const name = 'new-password-is-allowed';
        const email = `${name}@test.com`;
        const password = 'externalScreaming$123';
        const user = await userService.createUser({
            email,
            rootRole: customRole.id,
            name,
            password,
        });
        await expect(
            userService.changePasswordWithPreviouslyUsedPasswordCheck(
                user.id,
                'internalScreaming$123',
            ),
        ).resolves.not.toThrow();
    });
    test('Remembers 5 passwords', async () => {
        const name = 'remembers-5-passwords-like-a-boss';
        const email = `${name}@test.com`;
        const password = 'externalScreaming$123';
        const user = await userService.createUser({
            email,
            rootRole: customRole.id,
            name,
            password,
        });
        for (let i = 0; i < 5; i++) {
            await userService.changePasswordWithPreviouslyUsedPasswordCheck(
                user.id,
                `${password}${i}`,
            );
        }
        await expect(
            userService.changePasswordWithPreviouslyUsedPasswordCheck(
                user.id,
                `${password}`,
            ),
        ).resolves.not.toThrow(); // We've added 5 new passwords, so the original should work again
    });
    test('Can bypass check by directly calling the changePassword method', async () => {
        const name = 'can-bypass-check-like-a-boss';
        const email = `${name}@test.com`;
        const password = 'externalScreaming$123';
        const user = await userService.createUser({
            email,
            rootRole: customRole.id,
            name,
            password,
        });
        await expect(
            userService.changePassword(user.id, `${password}`),
        ).resolves.not.toThrow(); // By bypassing the check, we can still set the same password as currently set
    });
});
