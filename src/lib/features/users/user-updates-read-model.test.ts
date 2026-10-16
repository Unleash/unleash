import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';

let db: ITestDb;
const TABLE = 'users';
const INSERT_INSTANT = new Date();
beforeAll(async () => {
    db = await dbInit();

    for (let i = 0; i < 10; i += 1) {
        await db.rawDatabase(TABLE).insert({
            name: `test-user-${i}`,
            username: `test-user-${i}`,
            email: `test-user-${i}@example.com`,
            created_at: INSERT_INSTANT,
            updated_at: INSERT_INSTANT,
        });
    }
});

test('returns all users if page is large enough', async () => {
    const userUpdatesReadModel = db.stores.userUpdatesReadModel;

    const users =
        await userUpdatesReadModel.getUsersUpdatedAfterOrEqual(INSERT_INSTANT);
    expect(users).toHaveLength(10);
});

test('returns 0 if no users updated after timestamp', async () => {
    const userUpdatesReadModel = db.stores.userUpdatesReadModel;

    const users = await userUpdatesReadModel.getUsersUpdatedAfterOrEqual(
        new Date(INSERT_INSTANT.getTime() + 1),
    );
    expect(users).toHaveLength(0);
});

test('returns the users in pages', async () => {
    const userUpdatesReadModel = db.stores.userUpdatesReadModel;
    const pageSize = 4;

    const usersPage1 = await userUpdatesReadModel.getUsersUpdatedAfterOrEqual(
        INSERT_INSTANT,
        pageSize,
    );
    expect(usersPage1).toHaveLength(4);
    expect(usersPage1[0].username).toBe('test-user-0');

    const usersPage2 = await userUpdatesReadModel.getUsersUpdatedAfterOrEqual(
        INSERT_INSTANT,
        pageSize,
        usersPage1[usersPage1.length - 1].id,
    );
    expect(usersPage2).toHaveLength(4);
    expect(usersPage2[0].username).toBe('test-user-4');

    const usersPage3 = await userUpdatesReadModel.getUsersUpdatedAfterOrEqual(
        INSERT_INSTANT,
        pageSize,
        usersPage2[usersPage2.length - 1].id,
    );
    expect(usersPage3).toHaveLength(2);
    expect(usersPage3[1].username).toBe('test-user-9');

    const usersPage4 = await userUpdatesReadModel.getUsersUpdatedAfterOrEqual(
        INSERT_INSTANT,
        pageSize,
        usersPage3[usersPage3.length - 1].id,
    );
    expect(usersPage4).toHaveLength(0);
});

test('getLastUpdatedAt returns the latest updated_at timestamp with max id', async () => {
    const userUpdatesReadModel = db.stores.userUpdatesReadModel;

    const result = await userUpdatesReadModel.getLastUpdatedAt();
    expect(result).not.toBeNull();
    expect(result?.lastUpdatedAt).toEqual(INSERT_INSTANT);
    expect(result?.userId).toBeDefined();
    expect(result?.userId).toBe(10); // The last inserted user should have the highest ID
});

test('pages through users sharing one sub-millisecond updated_at and then stops', async () => {
    const userUpdatesReadModel = db.stores.userUpdatesReadModel;
    const sameTransactionInstant = '2099-01-01T00:00:00.000123Z';
    for (const name of ['bulk-1', 'bulk-2', 'bulk-3']) {
        await db.rawDatabase.raw(
            `INSERT INTO users (name, username, email, updated_at) VALUES (?, ?, ?, ?)`,
            [name, name, `${name}@example.com`, sameTransactionInstant],
        );
    }
    const syncNextPage = async (watermark: Date, afterId: number) => {
        const page = await userUpdatesReadModel.getUsersUpdatedAfterOrEqual(
            watermark,
            2,
            afterId,
        );
        const last = page[page.length - 1];
        return { page, watermark: last?.updatedAt!, afterId: last?.id };
    };

    const first = await syncNextPage(new Date('2098-01-01'), 0);
    const second = await syncNextPage(first.watermark, first.afterId);
    const third = await syncNextPage(second.watermark, second.afterId);

    expect(first.page.map((u) => u.username)).toEqual(['bulk-1', 'bulk-2']);
    expect(second.page.map((u) => u.username)).toEqual(['bulk-3']);
    expect(third.page).toHaveLength(0);
});
