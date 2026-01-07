import { createGetActiveUsers, type GetActiveUsers } from './getActiveUsers.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';

let db: ITestDb;
let getActiveUsers: GetActiveUsers;

const mockUserDaysAgo = (days: number) => {
    const result = new Date();
    result.setDate(result.getDate() - days);
    return {
        email: `${days}.user@example.com`,
        seen_at: result,
    };
};

const mockTokenDaysAgo = (userId: number, days: number) => {
    const result = new Date();
    result.setDate(result.getDate() - days);

    return {
        user_id: userId,
        seen_at: result,
        secret: 'secret',
        expires_at: new Date('2031-12-31'),
    };
};

beforeAll(async () => {
    db = await dbInit('active_users_serial', getLogger);
    getActiveUsers = createGetActiveUsers(db.rawDatabase);
});

afterEach(async () => {
    await db.rawDatabase('users').delete();
    await db.rawDatabase('personal_access_tokens').delete();
});

afterAll(async () => {
    await db.destroy();
});

test('should return 0 users', async () => {
    await expect(getActiveUsers()).resolves.toEqual({
        last7: 0,
        last30: 0,
        last60: 0,
        last90: 0,
    });
});

test('should return 1 user', async () => {
    await db.rawDatabase('users').insert(mockUserDaysAgo(1));

    await expect(getActiveUsers()).resolves.toEqual({
        last7: 1,
        last30: 1,
        last60: 1,
        last90: 1,
    });
});

test('should handle intervals of activity', async () => {
    await db
        .rawDatabase('users')
        .insert([
            mockUserDaysAgo(5),
            mockUserDaysAgo(10),
            mockUserDaysAgo(20),
            mockUserDaysAgo(40),
            mockUserDaysAgo(70),
            mockUserDaysAgo(100),
        ]);

    await expect(getActiveUsers()).resolves.toEqual({
        last7: 1,
        last30: 3,
        last60: 4,
        last90: 5,
    });
});

test('should count user as active if they have an active token', async () => {
    const users = await db
        .rawDatabase('users')
        .insert(mockUserDaysAgo(100))
        .returning('id');
    const userId = users[0].id;
    await db
        .rawDatabase('personal_access_tokens')
        .insert(mockTokenDaysAgo(userId, 31));

    await expect(getActiveUsers()).resolves.toEqual({
        last7: 0,
        last30: 0,
        last60: 1,
        last90: 1,
    });
});

test('should prioritize user seen_at if newer then token seen_at', async () => {
    const users = await db
        .rawDatabase('users')
        .insert(mockUserDaysAgo(14))
        .returning('id');
    const userId = users[0].id;
    await db
        .rawDatabase('personal_access_tokens')
        .insert([
            mockTokenDaysAgo(userId, 31),
            mockTokenDaysAgo(userId, 61),
            mockTokenDaysAgo(userId, 91),
        ]);

    await expect(getActiveUsers()).resolves.toEqual({
        last7: 0,
        last30: 1,
        last60: 1,
        last90: 1,
    });
});

test('should handle multiple users and with multiple tokens', async () => {
    const users = await db
        .rawDatabase('users')
        .insert([
            mockUserDaysAgo(5),
            mockUserDaysAgo(10),
            mockUserDaysAgo(20),
            mockUserDaysAgo(40),
            mockUserDaysAgo(70),
            mockUserDaysAgo(100),
        ])
        .returning('id');

    await db
        .rawDatabase('personal_access_tokens')
        .insert([
            mockTokenDaysAgo(users[0].id, 31),
            mockTokenDaysAgo(users[1].id, 61),
            mockTokenDaysAgo(users[1].id, 15),
            mockTokenDaysAgo(users[1].id, 55),
            mockTokenDaysAgo(users[2].id, 4),
            mockTokenDaysAgo(users[3].id, 91),
            mockTokenDaysAgo(users[4].id, 91),
        ]);

    await expect(getActiveUsers()).resolves.toEqual({
        last7: 2,
        last30: 3,
        last60: 4,
        last90: 5,
    });
});
