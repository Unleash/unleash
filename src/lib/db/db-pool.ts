import type { Knex } from 'knex';
import knexpkg from 'knex';
const { knex } = knexpkg;
import type { IUnleashConfig } from '../types/option.js';

export function createDb({
    db,
    getLogger,
}: Pick<IUnleashConfig, 'db' | 'getLogger'>): Knex {
    const logger = getLogger('db-pool.js');

    const k = knex({
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

    const pool = k.client?.pool;
    if (pool?.on) {
        const logStats = () => {
            logger.debug(
                `pool used=${pool.numUsed()} free=${pool.numFree()} ` +
                    `pendingCreates=${pool.numPendingCreates()} pendingAcquires=${pool.numPendingAcquires()}`,
            );
        };

        pool.on('createSuccess', logStats);
        pool.on('destroySuccess', logStats);
        pool.on('acquireSuccess', logStats);
        pool.on('release', logStats);
        pool.on('createFail', (e: unknown) =>
            logger.warn(`pool createFail: ${String(e)}`),
        );
        pool.on('acquireFail', (e: unknown) =>
            logger.warn(`pool acquireFail: ${String(e)}`),
        );
    } else {
        logger.warn('knex client pool not available to attach listeners');
    }

    return k;
}
