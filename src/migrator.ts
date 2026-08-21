import dbMigrateShared from 'db-migrate-shared';
const { log } = dbMigrateShared;
import dbMigrate from 'db-migrate';
const { getInstance } = dbMigrate;
import type { IUnleashConfig } from './lib/types/option.js';
import { secondsToMilliseconds } from 'date-fns';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { cloneDbConfig } from './lib/util/clone-db-config.js';
import { createConfig } from './lib/create-config.js';
import { createDb } from './lib/db/db-pool.js';
import type { Knex } from 'knex';

log.setLogLevel('error');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knexMigrationsConfig = {
    directory: path.join(__dirname, 'knex-migrations'),
    loadExtensions: ['.js'],
};

export const LEGACY_MIGRATION_CUTOFF =
    '20260724084058-set-default-value-for-user-created-for-api-token-v2.js';

async function noDatabaseUrl<T>(fn: () => Promise<T>): Promise<T> {
    // unset DATABASE_URL so it doesn't take presedence over the provided db config
    const dbUrlEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
        return await fn();
    } finally {
        if (dbUrlEnv === undefined) {
            delete process.env.DATABASE_URL;
        } else {
            process.env.DATABASE_URL = dbUrlEnv;
        }
    }
}

type MigrationConfig = Pick<IUnleashConfig, 'db'> &
    Partial<Pick<IUnleashConfig, 'getLogger'>>;

const createKnex = ({ db, getLogger }: MigrationConfig): Knex =>
    createDb(
        createConfig({
            db: {
                ...db,
                ssl: db.ssl ?? false,
                pool: {
                    ...db.pool,
                    min: 0,
                    max: Math.max(db.pool?.max ?? 0, 2),
                    propagateCreateError: true,
                },
            },
            ...(getLogger ? { getLogger } : {}),
        }),
    );

const createLegacyMigrator = ({ db }: MigrationConfig) => {
    const custom = {
        ...cloneDbConfig(db),
        connectionTimeoutMillis: secondsToMilliseconds(10),
    };

    process.argv = process.argv.filter((it) => !it.includes('--verbose'));
    return getInstance(true, {
        cwd: __dirname,
        config: { custom },
        env: 'custom',
    });
};

export async function migrateDb(
    config: MigrationConfig,
    stopAt?: string,
): Promise<void> {
    return noDatabaseUrl(async () => {
        await createLegacyMigrator(config).up(stopAt);
        if (stopAt) {
            return;
        }

        const knex = createKnex(config);
        try {
            await knex.migrate.latest(knexMigrationsConfig);
        } finally {
            await knex.destroy();
        }
    });
}

export async function requiresMigration(
    config: MigrationConfig,
): Promise<boolean> {
    return noDatabaseUrl(async () => {
        const pendingLegacyMigrations =
            await createLegacyMigrator(config).check();
        if (pendingLegacyMigrations.length > 0) {
            return true;
        }

        const knex = createKnex(config);
        try {
            const [, pendingKnexMigrations] =
                await knex.migrate.list(knexMigrationsConfig);
            return pendingKnexMigrations.length > 0;
        } finally {
            await knex.destroy();
        }
    });
}

// This exists to ease testing
export async function resetDb(config: IUnleashConfig): Promise<void> {
    return noDatabaseUrl(async () => {
        const knex = createKnex(config);
        try {
            await knex.migrate.rollback(knexMigrationsConfig, true);
        } finally {
            await knex.destroy();
        }
        return createLegacyMigrator(config).reset();
    });
}
