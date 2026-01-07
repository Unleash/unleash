import { log } from 'db-migrate-shared';
import { createStores } from '../../../lib/db/index.js';
import { createDb } from '../../../lib/db/db-pool.js';
import { getDbConfig } from './database-config.js';
import { createTestConfig } from '../../config/test-config.js';
import type { LogProvider } from '../../../lib/logger.js';
import noLoggerProvider from '../../fixtures/no-logger.js';
import type { IUnleashStores } from '../../../lib/types/index.js';
import type {
    IUnleashConfig,
    IUnleashOptions,
} from '../../../lib/server-impl.js';
import postgresPkg from 'pg';
const { Client } = postgresPkg;
import type { Knex } from 'knex';
import { randomUUID } from 'crypto';

// require('db-migrate-shared').log.silence(false);

// because of db-migrate bug (https://github.com/Unleash/unleash/issues/171)
process.setMaxListeners(0);

export const testDbPrefix = 'unleashtestdb_';

export interface ITestDb {
    config: IUnleashConfig;
    stores: IUnleashStores;
    reset: () => Promise<void>;
    destroy: () => Promise<void>;
    rawDatabase: Knex;
}

type DBTestOptions = {
    stopMigrationAt?: string; // filename where migration should stop
};

export default async function init(
    _databaseSchema = 'test',
    getLogger: LogProvider = noLoggerProvider,
    configOverride: Partial<IUnleashOptions & DBTestOptions> = {},
): Promise<ITestDb> {
    const testDbName = `${testDbPrefix}${randomUUID().replace(/-/g, '')}`;
    const testDBTemplateName = process.env.TEST_DB_TEMPLATE_NAME;
    const config = createTestConfig({
        db: {
            ...getDbConfig(),
            pool: { min: 1, max: 4 },
            database: testDbName,
            ssl: false,
        },
        ...configOverride,
        getLogger,
    });

    log.setLogLevel('error');

    if (!testDBTemplateName) {
        throw new Error(
            'TEST_DB_TEMPLATE_NAME environment variable is not set',
        );
    }
    const client = new Client(getDbConfig());
    await client.connect();

    await client.query(
        `CREATE DATABASE ${testDbName} TEMPLATE ${testDBTemplateName}`,
    );
    await client.query(`ALTER DATABASE ${testDbName} SET TIMEZONE TO UTC`);

    await client.end();

    const testDb = createDb(config);
    const stores = createStores(config, testDb);
    stores.eventStore.setMaxListeners(0);

    return {
        config,
        rawDatabase: testDb,
        stores,
        reset: async () => {},
        destroy: async () => {
            return new Promise<void>((resolve, reject) => {
                testDb.destroy((error) => (error ? reject(error) : resolve()));
            });
        },
    };
}
