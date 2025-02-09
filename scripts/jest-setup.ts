import { Client, type ClientConfig } from 'pg';
import { migrateDb } from '../src/migrator';
import { getDbConfig } from '../src/test/e2e/helpers/database-config';

let initializationPromise: Promise<void> | null = null;
const initializeTemplateDb = (db: ClientConfig): Promise<void> => {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            const testDBTemplateName = process.env.TEST_DB_TEMPLATE_NAME;
            const client = new Client(db);
            await client.connect();
            console.log(`Initializing template database ${testDBTemplateName}`);
            // code to clean up, but only on next run, we could do it at tear down... but is it really needed?
            // const result = await client.query(`select datname from pg_database where datname like 'unleashtestdb_%';`)
            // result.rows.forEach(async (row: any) => {
            //     console.log(`Dropping test database ${row.datname}`);
            //     await client.query(`DROP DATABASE ${row.datname}`);
            // });
            await client.query(`DROP DATABASE IF EXISTS ${testDBTemplateName}`);
            await client.query(`CREATE DATABASE ${testDBTemplateName}`);
            await client.end();
            // unset DATABASE_URL so it doesn't take presedence over the provided db config
            const dbUrlEnv = process.env.DATABASE_URL;
            delete process.env.DATABASE_URL;
            await migrateDb({
                db: { ...db, database: testDBTemplateName },
            } as any);
            process.env.DATABASE_URL = dbUrlEnv;
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
