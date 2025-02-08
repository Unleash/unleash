import { Client } from 'pg';
import { migrateDb } from '../src/migrator';
const templateDBSchemaName = `unleash_template_db`;
let initializationPromise: Promise<void> | null = null;
const initializeTemplateDb = (client: Client, db: any): Promise<void> => {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            console.log(
                `Initializing template database ${templateDBSchemaName}`,
            );
            // code to clean up, but only on next run, we could do it at tear down... but is it really needed?
            // const result = await client.query(`select datname from pg_database where datname like 'unleashtestdb_%';`)
            // result.rows.forEach(async (row: any) => {
            //     console.log(`Dropping test database ${row.datname}`);
            //     await client.query(`DROP DATABASE ${row.datname}`);
            // });
            await client.query(
                `DROP DATABASE IF EXISTS ${templateDBSchemaName}`,
            );
            await client.query(`CREATE DATABASE ${templateDBSchemaName}`);
            console.log(`Migrating template database ${templateDBSchemaName}`);
            await migrateDb({
                db: { ...db, database: templateDBSchemaName },
            } as any);
            console.log(`Template database migrated`);
        })();
    }
    return initializationPromise;
};

export async function initTemplate(db: any): Promise<void> {
    const testDB = { ...db, database: 'unleash_test' };
    const client = new Client(testDB);
    await client.connect();

    console.log(`Awaiting promise of template database initialization`);
    await initializeTemplateDb(client, testDB);
    console.log(`Template database initialized`);
    await client.end();
}

export default async function globalSetup() {
    process.env.TZ = 'UTC';
    await initTemplate({
        user: process.env.DB_USER || 'unleash_user',
        password: process.env.DB_PASSWORD || 'password',
        host: 'localhost',
        database: process.env.DB_NAME || 'unleash_test',
        driver: 'postgres',
        port: 5432,
        ssl: false,
        pool: { min: 0, max: 2 },
    });
}
