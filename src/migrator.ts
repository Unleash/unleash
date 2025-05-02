import { log } from 'db-migrate-shared';
import { getInstance } from 'db-migrate';
import type { IUnleashConfig } from './lib/types/option.js';
import { secondsToMilliseconds } from 'date-fns';
import path from 'path';

log.setLogLevel('error');

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
            cwd: path.resolve(process.cwd(), './src/'),
            config: { custom },
            env: 'custom',
        });

        return dbm.up(stopAt);
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
            cwd: import.meta.dirname,
            config: { custom },
            env: 'custom',
        });

        return dbm.reset();
    });
}
