import { knex, type Knex } from 'knex';
import ClientPgLite from 'knex-pglite';
import type { IUnleashConfig } from '../types/option';
import type { PGlite } from '@electric-sql/pglite';

export function createDb(
    { db, getLogger }: Pick<IUnleashConfig, 'db' | 'getLogger'>,
    pg?: PGlite,
): Knex {
    const logger = getLogger('db-pool.js');
    return knex({
        client: ClientPgLite,
        dialect: 'postgres',
        connection: {
            //@ts-ignore
            // pglite: pg || new PGlite(),
            filename: '/tmp/unleash.db',
        },
        searchPath: db.schema,
        asyncStackTraces: true,
        log: {
            debug: (msg) => logger.debug(msg),
            warn: (msg) => logger.warn(msg),
            error: (msg) => logger.error(msg),
        },
    });
}

// for backward compatibility
module.exports = {
    createDb,
};
