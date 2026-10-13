import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { createTestConfig } from '../../../config/test-config.js';
import type { EventService } from '../../../../lib/services/index.js';
import type UserService from '../../../../lib/services/user-service.js';
import { ADMIN, type IUser } from '../../../../lib/types/index.js';
import type { InactiveUsersService } from '../../../../lib/users/inactive/inactive-users-service.js';
import { createInactiveUsersService } from '../../../../lib/users/index.js';
import { extractAuditInfoFromUser } from '../../../../lib/util/index.js';
import {
    createEventsService,
    createUserService,
} from '../../../../lib/features/index.js';
import {
    withTransactional,
    type WithTransactional,
} from '../../../../lib/db/transaction.js';
import { USER_DELETED } from '../../../../lib/events/index.js';
import { subMonths } from 'date-fns';

let db: ITestDb;
let userService: WithTransactional<UserService>;
let eventService: EventService;
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
    const config = createTestConfig();
    eventService = createEventsService(db.rawDatabase, config);
    userService = withTransactional(
        (db) => createUserService(db, config),
        db.rawDatabase,
    );
    inactiveUserService = createInactiveUsersService(
        db.rawDatabase,
        config,
        userService,
    );
});

afterEach(async () => {
    await db.rawDatabase.raw('DELETE FROM users WHERE id > 1000');
    await db.rawDatabase.raw('DELETE FROM events');
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
            await userService.transactional((tx) =>
                tx.deleteInactiveUsers(
                    90,
                    extractAuditInfoFromUser(deletionUser),
                ),
            );
            await expect(
                userService.getUser(9595),
            ).rejects.toThrowErrorMatchingSnapshot('noUserSnapshot');
        });
        test('Finds users that was last logged in before our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who has not logged in in a while', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '182 DAYS')`);
            await userService.transactional((tx) =>
                tx.deleteInactiveUsers(
                    90,
                    extractAuditInfoFromUser(deletionUser),
                ),
            );
            await expect(
                userService.getUser(9595),
            ).rejects.toThrowErrorMatchingSnapshot('noUserSnapshot');
        });
        test('Does not delete users that was last logged in after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at, seen_at)
                                      VALUES (9595, 'test user who has logged in recently', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS', now() - INTERVAL '1 MONTH')`);
            await userService.transactional((tx) =>
                tx.deleteInactiveUsers(
                    90,
                    extractAuditInfoFromUser(deletionUser),
                ),
            );
            await expect(userService.getUser(9595)).resolves.toBeTruthy();
        });
        test('Does not delete users that has never logged in, but was created after our deadline', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '3 MONTHS')`);
            await userService.transactional((tx) =>
                tx.deleteInactiveUsers(
                    180,
                    extractAuditInfoFromUser(deletionUser),
                ),
            );
            await expect(userService.getUser(9595)).resolves.toBeTruthy();
        });
        test('Does not delete the user that calls the service', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (9595, 'test user who never logged in', 'nedryerson', 'ned@ryerson.com',
                                              now() - INTERVAL '7 MONTHS')`);
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                      VALUES (${deletionUser.id}, '${deletionUser.name}', '${deletionUser.username}', '${deletionUser.email}', now() - INTERVAL '7 MONTHS')`);
            await userService.transactional((tx) =>
                tx.deleteInactiveUsers(
                    90,
                    extractAuditInfoFromUser(deletionUser),
                ),
            );
            await expect(userService.getUser(9595)).rejects.toBeTruthy();
            await expect(
                userService.getUser(deletionUser.id),
            ).resolves.toBeTruthy();
        });
    });
    describe('Events on deletion', () => {
        test('should emit events', async () => {
            await db.rawDatabase.raw(`INSERT INTO users(id, name, username, email, created_at)
                                       VALUES (9595, 'test user who has not logged in in a while', 'nedryerson', 'ned@ryerson.com',
                                               now() - INTERVAL '7 MONTHS')`);
            await userService.transactional((tx) =>
                tx.deleteInactiveUsers(
                    90,
                    extractAuditInfoFromUser(deletionUser),
                ),
            );
            const events = await eventService.searchEvents(
                {
                    type: `IS:${USER_DELETED}`,
                    offset: 0,
                    limit: 10,
                },
                -1337,
            );
            console.log(events);
            expect(events.totalEvents).toBe(1);
            await expect(events.events[0].type).toBe(USER_DELETED);
        });
        test('Still works with 10000 users', async () => {
            const rows: {
                id: number;
                name: string;
                username: string;
                email: string;
                created_at: Date;
            }[] = [];
            const createdAt = subMonths(new Date(), 7);
            for (let i = 0; i < 10000; i++) {
                const id = 10000 + i;
                const row = {
                    id,
                    name: 'test user who has not logged in in a while',
                    username: `nedryerson_${i}`,
                    email: `ned${i}@ryerson.com`,
                    created_at: createdAt,
                };
                rows.push(row);
            }
            await db.rawDatabase.batchInsert('users', rows);
            await userService.transactional((tx) =>
                tx.deleteInactiveUsers(
                    90,
                    extractAuditInfoFromUser(deletionUser),
                ),
            );
            const events = await eventService.searchEvents(
                {
                    type: `IS:${USER_DELETED}`,
                    offset: 0,
                    limit: 1,
                },
                -1337,
            );
            expect(events.totalEvents).toBe(10000);
        });
    });
    describe('Transactionality', () => {
        test('Rolls back user deletion when storing audit events fails', async () => {
            const userId = 9595;

            await db.rawDatabase('users').insert({
                id: userId,
                name: 'User to be deleted',
                username: 'rollback_test_user',
                email: 'rollback@example.com',
                created_at: subMonths(new Date(), 7),
            });

            await db.rawDatabase('role_user').insert({
                user_id: userId,
                role_id: 3,
                project: 'default', // Use an existing role ID
            });

            // Force audit event insertion to fail.
            await db.rawDatabase.raw(`
        CREATE OR REPLACE FUNCTION fail_user_deleted_event()
        RETURNS trigger AS $$
        BEGIN
            IF NEW.type = '${USER_DELETED}' THEN
                RAISE EXCEPTION 'Simulated audit event failure';
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER fail_user_deleted_event_trigger
        BEFORE INSERT ON events
        FOR EACH ROW
        EXECUTE FUNCTION fail_user_deleted_event();
    `);

            try {
                await expect(
                    userService.transactional((tx) =>
                        tx.deleteInactiveUsers(
                            90,
                            extractAuditInfoFromUser(deletionUser),
                        ),
                    ),
                ).rejects.toThrow('Simulated audit event failure');

                // User deletion must be rolled back.
                await expect(userService.getUser(userId)).resolves.toBeTruthy();

                // Permission cleanup must be rolled back.
                const roles = await db
                    .rawDatabase('role_user')
                    .where('user_id', userId);
                expect(roles).toHaveLength(1);

                // Audit event must not have been committed.
                const events = await eventService.searchEvents(
                    {
                        type: `IS:${USER_DELETED}`,
                        offset: 0,
                        limit: 10,
                    },
                    -1337,
                );
                expect(events.totalEvents).toBe(0);
            } finally {
                await db.rawDatabase.raw(`
            DROP TRIGGER IF EXISTS fail_user_deleted_event_trigger ON events;
            DROP FUNCTION IF EXISTS fail_user_deleted_event();
        `);
            }
        });
    });
});
