import { getDbConfig } from './helpers/database-config';
import { createTestConfig } from '../config/test-config';
import { getInstance } from 'db-migrate';
import { Client } from 'pg';
import { IDBOption } from 'lib/types';

async function initSchema(db: IDBOption): Promise<void> {
    const client = new Client(db);
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS ${db.schema} CASCADE`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${db.schema}`);
    await client.end();
}

test('Up & down migrations work', async () => {
    jest.setTimeout(15000);
    const config = createTestConfig({
        db: {
            ...getDbConfig(),
            pool: { min: 1, max: 4 },
            schema: 'up_n_down_migrations_test',
            ssl: false,
        },
    });

    await initSchema(config.db);

    const e2e = {
        ...config.db,
        connectionTimeoutMillis: 2000,
    };

    const dbm = getInstance(true, {
        cwd: `${__dirname}/../../`, // relative to src/test/e2e
        config: { e2e },
        env: 'e2e',
    });

    await dbm.up();
    await dbm.reset();
});
