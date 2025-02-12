import { log } from 'db-migrate-shared';
import getLogger from '../../test/fixtures/no-logger';
import dbInit, { type ITestDb } from '../../test/e2e/helpers/database-init';
import { migrateDb } from '../../migrator';

log.setLogLevel('error');

let db: ITestDb;
afterAll(async () => {
    await db.destroy();
});
test('System user creation migration correctly sets is_system', async () => {
    jest.setTimeout(15000);
    db = await dbInit('system_user_migration', getLogger, {
        stopMigrationAt: '20231221143955-feedback-table.js',
        dbInitMethod: 'legacy',
    });

    await db.rawDatabase.raw(`
        INSERT INTO "users"
            (name, username, email, created_by_user_id)
        VALUES
            ('Test Person', 'testperson', 'testperson@getunleash.io', 1);
    `);

    // Run the migration
    await migrateDb(db.config, '20231222071533-unleash-system-user.js');

    // Check the results
    const { rows: userResults } = await db.rawDatabase.raw(`
        SELECT * FROM "users" ORDER BY id;
    `);

    console.log(userResults.map((r) => `${r.username} (${r.id})`));

    expect(userResults.length).toEqual(2);
    expect(userResults[0].is_system).toEqual(true);
    expect(userResults[0].id).toEqual(-1337);
    expect(userResults[0].username).toEqual('unleash_system_user');
    expect(userResults[1].is_system).toEqual(false);
    expect(userResults[1].id).toEqual(1);
    expect(userResults[1].username).toEqual('testperson');
});
