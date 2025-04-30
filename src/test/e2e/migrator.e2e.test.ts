import dbInit, { type ITestDb } from '../../test/e2e/helpers/database-init.js';

import getLogger from '../../test/fixtures/no-logger.js';

import { log } from 'db-migrate-shared';
import postgresPkg from 'pg';
const { Client } = postgresPkg;
import type { IDBOption } from '../../lib/types/index.js';
import { resetDb } from '../../migrator.js';

log.setLogLevel('error');

async function validateTablesHavePrimaryKeys(db: IDBOption) {
    const client = new Client(db);
    await client.connect();
    const tables = await client.query<{ table_name: string }>(
        `SELECT
        t.table_name
    FROM
        information_schema.tables t
    LEFT JOIN
        information_schema.table_constraints tc ON t.table_schema = tc.table_schema
        AND t.table_name = tc.table_name
        AND tc.constraint_type = 'PRIMARY KEY'
    WHERE
        t.table_type = 'BASE TABLE'
        AND t.table_schema NOT IN ('pg_catalog', 'information_schema')
        AND tc.constraint_name IS NULL;
    `,
    );
    await client.end();
    if ((tables.rowCount ?? 0) > 0) {
        throw new Error(
            `The following tables do not have a primary key defined: ${tables.rows
                .map((r) => r.table_name)
                .join(', ')}`,
        );
    }
}
let db: ITestDb;
afterAll(async () => {
    await db.destroy();
});
test('Up & down migrations work', async () => {
    db = await dbInit('system_user_migration', getLogger);
    // up migration is performed at the beginning of tests
    // here we just validate that the tables have primary keys
    await validateTablesHavePrimaryKeys(db.config.db);
    // then we test down migrations
    await resetDb(db.config);
});
