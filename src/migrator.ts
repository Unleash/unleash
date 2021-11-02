import { log } from 'db-migrate-shared';
import { getInstance } from 'db-migrate';
import { IUnleashConfig } from './lib/types/option';
import { secondsToMilliseconds } from 'date-fns';

log.setLogLevel('error');

export async function migrateDb({ db }: IUnleashConfig): Promise<void> {
    const custom = {
        ...db,
        connectionTimeoutMillis: secondsToMilliseconds(10),
    };

    const dbm = getInstance(true, {
        cwd: __dirname,
        config: { custom },
        env: 'custom',
    });

    return dbm.up();
}

// This exists to ease testing
export async function resetDb({ db }: IUnleashConfig): Promise<void> {
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
}
