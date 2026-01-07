import postgresPkg from 'pg';
const { Client } = postgresPkg;
import {
    migrateDb,
    getDbConfig,
    testDbPrefix,
    type IUnleashConfig,
} from 'unleash-server';

let initializationPromise: Promise<void> | null = null;

const initializeTemplateDb = (db: IUnleashConfig['db']): Promise<void> => {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            const testDBTemplateName = process.env.TEST_DB_TEMPLATE_NAME;

            if (!testDBTemplateName) {
                throw new Error(
                    'Env variable TEST_DB_TEMPLATE_NAME is not set',
                );
            }
            const client = new Client(db);
            await client.connect();
            console.log(`Initializing template database ${testDBTemplateName}`);
            // first clean up databases from previous runs
            const result = await client.query(
                `select datname from pg_database where datname like '${testDbPrefix}%';`,
            );
            await Promise.all(
                result.rows.map((row) => {
                    return client.query(`DROP DATABASE ${row.datname}`);
                }),
            );
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
