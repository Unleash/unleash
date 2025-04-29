import type { IUnleashConfig } from './lib/types/option.js';
import { secondsToMilliseconds } from 'date-fns';
import type { Knex } from 'knex';
import { createDb } from './lib/db/db-pool.js';
import { createConfig } from './lib/create-config.js';

async function noDatabaseUrl<T>(fn: () => Promise<T>): Promise<T> {
    // unset DATABASE_URL so it doesn't take presedence over the provided db config
    const dbUrlEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = fn();
    process.env.DATABASE_URL = dbUrlEnv;
    return result;
}
export async function migrateDb(
    { db, getLogger }: IUnleashConfig,
    stopAt?: string,
): Promise<void> {
    return noDatabaseUrl(async () => {
        const knex: Knex = createDb({ db, getLogger });
        const logger = {
            info: console.log,
            error: console.log,
        };

        try {
            const hasOldMigrationTable =
                await knex.schema.hasTable('migrations');

            const firstMigrationName = (await knex.migrate.list())[0][0].name;
            if (hasOldMigrationTable) {
                logger.info(
                    'Old migration table detected. Marking initial migration as done.',
                );

                const existing = await knex('knex_migrations')
                    .where({ name: firstMigrationName })
                    .first();

                if (!existing) {
                    await knex('knex_migrations').insert({
                        name: firstMigrationName,
                        batch: 1,
                        migration_time: new Date(),
                    });
                } else {
                    logger.info('Initial migration already marked as applied.');
                }
            } else {
                logger.info(
                    'No old migration table found. Running full schema migration.',
                );
                await knex.migrate.latest();
            }
        } catch (error) {
            logger.error('Error during migration initialization:', error);
            process.exit(1);
        } finally {
            await knex.destroy();
        }
    });
}

// This exists to ease testing
export async function resetDb({ db }: IUnleashConfig): Promise<void> {
    return noDatabaseUrl(async () => {
        const custom = {
            ...db,
            connectionTimeoutMillis: secondsToMilliseconds(10),
        };
        // TODO: Implement reset logic if needed
    });
}

migrateDb(
    createConfig({
        // defaults takenf rom src/server-dev.ts
        db: {
            user: 'unleash_user',
            password: 'password',
            host: 'localhost',
            port: 5432,
            database: process.env.UNLEASH_DATABASE_NAME || 'unleash',
            schema: process.env.UNLEASH_DATABASE_SCHEMA,
            ssl: false,
            applicationName: 'unleash',
        },
    }),
);
