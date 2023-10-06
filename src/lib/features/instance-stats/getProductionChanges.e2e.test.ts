import { createGetActiveUsers, type GetActiveUsers } from './getActiveUsers';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import {
    createGetProductionChanges,
    GetProductionChanges,
} from './getProductionChanges';
import subDays from 'date-fns/subDays';
let db: ITestDb;
let getProductionChanges: GetProductionChanges;

const mockEventDaysAgo = (days: number, environment: string = 'production') => {
    const result = new Date();
    result.setDate(result.getDate() - days);
    return {
        day: result,
        environment,
        updates: 1,
    };
};

const mockRawEventDaysAgo = (
    days: number,
    environment: string = 'production',
) => {
    const day = subDays(new Date(), days);
};

beforeAll(async () => {
    db = await dbInit('product_changes_serial', getLogger);
    getProductionChanges = createGetProductionChanges(db.rawDatabase);
});

afterEach(async () => {
    await db.rawDatabase('stat_environment_updates').delete();
});

afterAll(async () => {
    await db.destroy();
});

test('should return 0 changes from an empty database', async () => {
    await expect(getProductionChanges()).resolves.toEqual({
        last30: 0,
        last60: 0,
        last90: 0,
    });
});

test('should return 1 change', async () => {
    await db
        .rawDatabase('stat_environment_updates')
        .insert(mockEventDaysAgo(1));

    await expect(getProductionChanges()).resolves.toEqual({
        last30: 1,
        last60: 1,
        last90: 1,
    });
});

test('should handle intervals of activity', async () => {
    await db
        .rawDatabase('stat_environment_updates')
        .insert([
            mockEventDaysAgo(5),
            mockEventDaysAgo(10),
            mockEventDaysAgo(20),
            mockEventDaysAgo(40),
            mockEventDaysAgo(70),
            mockEventDaysAgo(100),
        ]);

    await expect(getProductionChanges()).resolves.toEqual({
        last30: 3,
        last60: 4,
        last90: 5,
    });
});

/*
test('an event being saved should add a count to the table', async () => {
    const users = await db
        .rawDatabase('events')
        .insert(mockRawEventDaysAgo(mockEventDaysAgo(100))
        .returning('id');
    const userId = users[0].id;
    await db
        .rawDatabase('personal_access_tokens')
        .insert(mockTokenDaysAgo(userId, 31));

    expect(getActiveUsers()).resolves.toEqual({
        last7: 0,
        last30: 0,
        last60: 1,
        last90: 1,
    });
});

test('should prioritize user seen_at if newer then token seen_at', async () => {
    const users = await db
        .rawDatabase('users')
        .insert(mockEventDaysAgo(14))
        .returning('id');
    const userId = users[0].id;
    await db
        .rawDatabase('personal_access_tokens')
        .insert([
            mockTokenDaysAgo(userId, 31),
            mockTokenDaysAgo(userId, 61),
            mockTokenDaysAgo(userId, 91),
        ]);

    expect(getActiveUsers()).resolves.toEqual({
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
            mockEventDaysAgo(5),
            mockEventDaysAgo(10),
            mockEventDaysAgo(20),
            mockEventDaysAgo(40),
            mockEventDaysAgo(70),
            mockEventDaysAgo(100),
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

    expect(getActiveUsers()).resolves.toEqual({
        last7: 2,
        last30: 3,
        last60: 4,
        last90: 5,
    });
});
*/
