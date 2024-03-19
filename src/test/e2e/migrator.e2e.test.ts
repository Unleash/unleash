import { getDbConfig } from './helpers/database-config';
import { createTestConfig } from '../config/test-config';
import { getInstance } from 'db-migrate';
import { log } from 'db-migrate-shared';
import { Client } from 'pg';
import type { IDBOption } from '../../lib/types';

log.setLogLevel('error');

const schema = 'up_n_down_migrations_test';

async function initSchema(db: IDBOption): Promise<void> {
    const client = new Client(db);
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS ${db.schema} CASCADE`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${db.schema}`);
    await client.end();
}

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
        AND t.table_schema = '${schema}' 
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

test('Up & down migrations work', async () => {
    jest.setTimeout(15000);
    const config = createTestConfig({
        db: {
            ...getDbConfig(),
            pool: { min: 1, max: 4 },
            schema: schema,
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

    await dbm.up();
    await validateTablesHavePrimaryKeys(config.db);
    await dbm.reset();
});
