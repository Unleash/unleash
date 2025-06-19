import dbMigrateShared from 'db-migrate-shared';
const { log } = dbMigrateShared;
import dbMigrate from 'db-migrate';
const { getInstance } = dbMigrate;
import type { IUnleashConfig } from './lib/types/option.js';
import { secondsToMilliseconds } from 'date-fns';
import path from 'path';
import { fileURLToPath } from 'node:url';

log.setLogLevel('error');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function noDatabaseUrl<T>(fn: () => Promise<T>): Promise<T> {
    // unset DATABASE_URL so it doesn't take presedence over the provided db config
    const dbUrlEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = fn();
    process.env.DATABASE_URL = dbUrlEnv;
    return result;
}
export async function migrateDb(
    { db }: Pick<IUnleashConfig, 'db'>,
    stopAt?: string,
): Promise<void> {
    return noDatabaseUrl(async () => {
        const custom = {
            ...db,
            connectionTimeoutMillis: secondsToMilliseconds(10),
        };

        // disable Intellij/WebStorm from setting verbose CLI argument to db-migrator
        process.argv = process.argv.filter((it) => !it.includes('--verbose'));
        const dbm = getInstance(true, {
            cwd: __dirname,
            config: { custom },
            env: 'custom',
        });

        return dbm.up(stopAt);
    });
}

export async function requiresMigration({
    db,
}: Pick<IUnleashConfig, 'db'>): Promise<boolean> {
    return noDatabaseUrl(async () => {
        const custom = {
            ...db,
            connectionTimeoutMillis: secondsToMilliseconds(10),
        };

        // disable Intellij/WebStorm from setting verbose CLI argument to db-migrator
        process.argv = process.argv.filter((it) => !it.includes('--verbose'));
        const dbm = getInstance(true, {
            cwd: __dirname,
            config: { custom },
            env: 'custom',
        });

        const pendingMigrations = await dbm.check();
        return pendingMigrations.length > 0;
    });
}

// This exists to ease testing
export async function resetDb({ db }: IUnleashConfig): Promise<void> {
    return noDatabaseUrl(async () => {
        const custom = {
            ...db,
            connectionTimeoutMillis: secondsToMilliseconds(10),
        };

        const dbm = getInstance(true, {
            cwd: __dirname,
            config: { custom },
            env: 'custom',
        });

        return dbm.reset();
    });
}
