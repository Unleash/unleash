import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { createTestConfig } from '../../../config/test-config';
import {
    AccessService,
    EmailService,
    EventService,
    GroupService,
} from '../../../../lib/services';
import ResetTokenService from '../../../../lib/services/reset-token-service';
import SessionService from '../../../../lib/services/session-service';
import SettingService from '../../../../lib/services/setting-service';
import UserService from '../../../../lib/services/user-service';
import { ADMIN, IUnleashStores, IUser } from '../../../../lib/types';
import { InactiveUsersService } from '../../../../lib/users/inactive/inactive-users-service';
import { createInactiveUsersService } from '../../../../lib/users';

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
    eventService = new EventService(stores, config);
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
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
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
    });
    describe('Deleting inactive users', () => {
        test('Deletes users that have never logged in but was created before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS')`);
            await inactiveUserService.deleteInactiveUsers(deletionUser);
            await expect(
                userService.getUser(9595),
            ).rejects.toThrowErrorMatchingSnapshot('noUserSnapshot');
        });
        test('Finds users that was last logged in before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '182 DAYS')`);
            await inactiveUserService.deleteInactiveUsers(deletionUser);
            await expect(
                userService.getUser(9595),
            ).rejects.toThrowErrorMatchingSnapshot('noUserSnapshot');
        });
        test('Does not delete users that was last logged in after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '1 MONTH')`);
            await inactiveUserService.deleteInactiveUsers(deletionUser);
            await expect(userService.getUser(9595)).resolves.toBeTruthy();
        });
        test('Does not delete users that has never logged in, but was created after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '3 MONTHS')`);
            await inactiveUserService.deleteInactiveUsers(deletionUser);
            await expect(userService.getUser(9595)).resolves.toBeTruthy();
        });
    });
});
