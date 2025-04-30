import type { IUnleashConfig } from './lib/types/option.js';
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
            const [completedMigrations, pendingMigrations] =
                await knex.migrate.list();
            logger.info(
                `Migrations completed: ${completedMigrations.length}, pending: ${pendingMigrations.length}`,
            );
            if (
                completedMigrations.length === 0 &&
                (await knex.schema.hasTable('migrations'))
            ) {
                // this is the first knex migration but there's a database in place
                // TODO we need to check that older migrations were applied
                const firstPendingMigrationName = pendingMigrations[0].file;
                logger.info(
                    'Old migration table detected. Marking initial knex migration as done.',
                );
                await knex('knex_migrations').insert({
                    name: firstPendingMigrationName,
                    batch: 1,
                    migration_time: new Date(),
                });
            } else if (pendingMigrations.length > 0) {
                // either we've already initialized knex migrations or we are running on a fresh database
                logger.info('Running knex schema migration.');
                await knex.migrate.latest();
                logger.info('Knex schema migration completed successfully.');
            } else {
                logger.info('No pending migrations. Skipping.');
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
