import type { Knex } from 'knex';
import knexpkg from 'knex';
const { knex } = knexpkg;
import type { IUnleashConfig } from '../types/option.js';

export function createDb({
    db,
    getLogger,
}: Pick<IUnleashConfig, 'db' | 'getLogger'>): Knex {
    const logger = getLogger('db-pool.js');
    return knex({
        client: 'pg',
        version: db.version,
        connection: {
            ...db,
            application_name: db.applicationName,
        },
        pool: db.pool,
        searchPath: db.schema,
        asyncStackTraces: true,
        log: {
            debug: (msg) => logger.debug(msg),
            warn: (msg) => logger.warn(msg),
            error: (msg) => logger.error(msg),
        },
    });
}
