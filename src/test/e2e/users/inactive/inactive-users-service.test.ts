import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { createTestConfig } from '../../../config/test-config.js';
import {
    AccessService,
    EmailService,
    type EventService,
    GroupService,
    ResourceLimitsService,
} from '../../../../lib/services/index.js';
import ResetTokenService from '../../../../lib/services/reset-token-service.js';
import SessionService from '../../../../lib/services/session-service.js';
import SettingService from '../../../../lib/services/setting-service.js';
import UserService from '../../../../lib/services/user-service.js';
import {
    ADMIN,
    type IUnleashStores,
    type IUser,
} from '../../../../lib/types/index.js';
import type { InactiveUsersService } from '../../../../lib/users/inactive/inactive-users-service.js';
import { createInactiveUsersService } from '../../../../lib/users/index.js';
import { extractAuditInfoFromUser } from '../../../../lib/util/index.js';
import { createEventsService } from '../../../../lib/features/index.js';

let db: ITestDb;
let stores: IUnleashStores;
let userService: UserService;
let sessionService: SessionService;
let settingService: SettingService;
let eventService: EventService;
let accessService: AccessService;
let inactiveUserService: InactiveUsersService;
const deletionUser: IUser = {
    id: -12,
    name: 'admin user for deletion',
    username: 'admin',
    email: 'admin@example.com',
    permissions: [ADMIN],
    isAPI: false,
    imageUrl: '',
};
beforeAll(async () => {
    db = await dbInit('inactive_user_service_serial', getLogger);
    stores = db.stores;
    const config = createTestConfig();
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
    const resourceLimitsService = new ResourceLimitsService(config);

    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
        resourceLimitsService,
    });
    inactiveUserService = createInactiveUsersService(
        db.rawDatabase,
        config,
        userService,
    );
});

afterEach(async () => {
    await db.rawDatabase.raw('DELETE FROM users WHERE id > 1000');
});
afterAll(async () => {
    await db.destroy();
});

describe('Inactive users service', () => {
    describe('Finding inactive users', () => {
        test('Finds users that have never logged in but was created before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(1);
        });
        test('Finds users that was last logged in before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '182 DAYS')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(1);
        });
        test('Does not find users that was last logged in after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who has logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '1 MONTH')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
        test('Does not find users that has never logged in, but was created after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '3 MONTHS')`);
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
        test('A user with a pat that was last seen last week is not inactive', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user with active PAT', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '200 DAYS')`);
            await db.rawDatabase.raw(
                `INSERT INTO personal_access_tokens(secret, user_id, expires_at, seen_at, created_at)
                      VALUES ('user:somefancysecret', 9595, now() + INTERVAL '6 MONTHS', now() - INTERVAL '1 WEEK', now() - INTERVAL '8 MONTHS')`,
            );
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
        test('A user with a pat that was last seen 7 months ago is inactive', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user with active PAT', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '200 DAYS')`);
            await db.rawDatabase.raw(
                `INSERT INTO personal_access_tokens(secret, user_id, expires_at, seen_at, created_at) VALUES ('user:somefancysecret', 9595, now() + INTERVAL '6 MONTHS', now() - INTERVAL '7 MONTHS', now() - INTERVAL '8 MONTHS')`,
            );
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(1);
        });
        test('A user with a pat that was seen 7 months ago, but logged in yesterday should not be inactive', async () => {
            await db.rawDatabase.raw(
                `INSERT INTO users(id, name, username, email, created_at, seen_at) VALUES (9595, 'test user with active login and old PAT', 'nedryerson', 'ned@ryerson.com', now() - INTERVAL '1 YEAR', now() - INTERVAL '1 DAY')`,
            );
            await db.rawDatabase.raw(
                `INSERT INTO personal_access_tokens(secret, user_id, expires_at, seen_at, created_at) VALUES ('user:somefancysecret', 9595, now() + INTERVAL '6 MONTHS', now() - INTERVAL '7 MONTHS', now() - INTERVAL '8 MONTHS')`,
            );
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
        test('System users and service users are not returned, even if not seen', async () => {
            await db.rawDatabase.raw(
                `INSERT INTO users(id, name, created_at, is_service) VALUES (4949, 'service_account', now() - INTERVAL '1 YEAR', true)`,
            );
            await db.rawDatabase.raw(
                `INSERT INTO users(id, name, created_at, is_system) VALUES (13337, 'service_account', now() - INTERVAL '1 YEAR', true)`,
            );
            const users = await inactiveUserService.getInactiveUsers();
            expect(users).toBeTruthy();
            expect(users).toHaveLength(0);
        });
    });
    describe('Deleting inactive users', () => {
        test('Deletes users that have never logged in but was created before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers(
                extractAuditInfoFromUser(deletionUser),
                usersToDelete,
            );
            await expect(
                userService.getUser(9595),
            ).rejects.toThrowErrorMatchingSnapshot('noUserSnapshot');
        });
        test('Finds users that was last logged in before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who has not logged in in a while', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '182 DAYS')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers(
                extractAuditInfoFromUser(deletionUser),
                usersToDelete,
            );
            await expect(
                userService.getUser(9595),
            ).rejects.toThrowErrorMatchingSnapshot('noUserSnapshot');
        });
        test('Does not delete users that was last logged in after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who has logged in recently', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '1 MONTH')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers(
                extractAuditInfoFromUser(deletionUser),
                usersToDelete,
            );
            await expect(userService.getUser(9595)).resolves.toBeTruthy();
        });
        test('Does not delete users that has never logged in, but was created after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '3 MONTHS')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers(
                extractAuditInfoFromUser(deletionUser),
                usersToDelete,
            );
            await expect(userService.getUser(9595)).resolves.toBeTruthy();
        });
        test('Does not delete the user that calls the service', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS')`);
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (${deletionUser.id}, '${deletionUser.name}', '${deletionUser.username}', '${deletionUser.email}', now() - INTERVAL '7 MONTHS')`);
            const usersToDelete = await inactiveUserService
                .getInactiveUsers()
                .then((users) => users.map((user) => user.id));
            await inactiveUserService.deleteInactiveUsers(
                extractAuditInfoFromUser(deletionUser),
                usersToDelete,
            );
            await expect(userService.getUser(9595)).rejects.toBeTruthy();
            await expect(
                userService.getUser(deletionUser.id),
            ).resolves.toBeTruthy();
        });
    });
});
