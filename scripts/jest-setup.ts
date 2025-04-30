import { Client } from 'pg';
import { migrateDb } from '../src/migrator.ts';
import { getDbConfig } from '../src/test/e2e/helpers/database-config.ts';
import { testDbPrefix } from '../src/test/e2e/helpers/database-init.ts';

let initializationPromise = null;

const initializeTemplateDb = (db) => {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            const testDBTemplateName = process.env.TEST_DB_TEMPLATE_NAME;

            const client = new Client(db);
            await client.connect();
            console.log(`Initializing template database ${testDBTemplateName}`);
            // first clean up databases from previous runs
            const result = await client.query(
                `select datname from pg_database where datname like '${testDbPrefix}%';`,
            );
            result.rows.forEach(async (row) => {
                console.log(`Dropping test database ${row.datname}`);
                await client.query(`DROP DATABASE ${row.datname}`);
            });
            await client.query(`DROP DATABASE IF EXISTS ${testDBTemplateName}`);
            await client.query(`CREATE DATABASE ${testDBTemplateName}`);
            await client.end();
            await migrateDb({
                db: { ...db, database: testDBTemplateName },
            });
            console.log(`Template database ${testDBTemplateName} migrated`);
        })();
    }
    return initializationPromise;
};

export default async function globalSetup() {
    process.env.TZ = 'UTC';
    process.env.TEST_DB_TEMPLATE_NAME = 'unleash_template_db';
    await initializeTemplateDb(getDbConfig());
}
