import { Client, type ClientConfig } from 'pg';
import { migrateDb } from '../src/migrator';
import { testDBTemplateName } from '../src/test/e2e/helpers/database-init';
import { getDbConfig } from '../src/test/e2e/helpers/database-config';

let initializationPromise: Promise<void> | null = null;
const initializeTemplateDb = (db: ClientConfig): Promise<void> => {
    if (!initializationPromise) {
        initializationPromise = (async () => {
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
            console.log(`Migrating template database ${testDBTemplateName}`);
            await migrateDb({
                db: { ...db, database: testDBTemplateName },
            } as any);
            console.log(`Template database migrated`);
            await client.end();
        })();
    }
    return initializationPromise;
};

export default async function globalSetup() {
    process.env.TZ = 'UTC';
    await initializeTemplateDb(getDbConfig());
}
