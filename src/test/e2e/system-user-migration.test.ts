import { getDbConfig } from './helpers/database-config';
import { createTestConfig } from '../config/test-config';
import { getInstance } from 'db-migrate';
import { log } from 'db-migrate-shared';
import { Client } from 'pg';
import type { IDBOption } from '../../lib/types';

log.setLogLevel('error');

async function initSchema(db: IDBOption): Promise<void> {
    const client = new Client(db);
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS ${db.schema} CASCADE`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${db.schema}`);
    await client.end();
}

test('System user creation migration correctly sets is_system', async () => {
    jest.setTimeout(15000);
    const config = createTestConfig({
        db: {
            ...getDbConfig(),
            pool: { min: 1, max: 4 },
            schema: 'system_user_migration_test',
            ssl: false,
        },
    });

    await initSchema(config.db);

    const e2e = {
        ...config.db,
        connectionTimeoutMillis: 2000,
    };

    // disable Intellij/WebStorm from setting verbose CLI argument to db-migrator
    process.argv = process.argv.filter((it) => !it.includes('--verbose'));
    const dbm = getInstance(true, {
        cwd: `${__dirname}/../../`, // relative to src/test/e2e
        config: { e2e },
        env: 'e2e',
    });

    // Run all migrations up to, and including, this one, the last one before the system user migration
    await dbm.up('20231221143955-feedback-table.js');

    // Set up the test data
    const client = new Client(config.db);
    await client.connect();

    await client.query(`
        INSERT INTO "system_user_migration_test"."users"
            (name, username, email, created_by_user_id)
        VALUES
            ('Test Person', 'testperson', 'testperson@getunleash.io', 1);
    `);

    // Run the migration
    await dbm.up('20231222071533-unleash-system-user.js');

    // Check the results
    const { rows: userResults } = await client.query(`
        SELECT * FROM "system_user_migration_test"."users" ORDER BY id;
    `);

    await client.end();
    await dbm.reset();

    expect(userResults.length).toEqual(2);
    expect(userResults[0].is_system).toEqual(true);
    expect(userResults[0].id).toEqual(-1337);
    expect(userResults[0].username).toEqual('unleash_system_user');
    expect(userResults[1].is_system).toEqual(false);
    expect(userResults[1].id).toEqual(1);
    expect(userResults[1].username).toEqual('testperson');
});
