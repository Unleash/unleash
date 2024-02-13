import { knex, Knex } from 'knex';
import { IUnleashConfig } from '../types/option';
import timer from '../util/timer';

export function createDb({
    db,
    getLogger,
}: Pick<IUnleashConfig, 'db' | 'getLogger'>): Knex {
    const logger = getLogger('db-pool.js');
    const conn = knex({
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

    // Object to store the start times of queries
    const queryTimes = {};

    conn.on('query', (query) => {
        const { __knexQueryUid } = query;
        queryTimes[__knexQueryUid] = timer.new();
    });

    conn.on('query-response', (response, query) => {
        const { __knexQueryUid } = query;
        const durationInSeconds = queryTimes[__knexQueryUid]();
        console.log(`Query ${query.sql} took ${durationInSeconds * 1000}ms`);
        // Clean up the start time record
        delete queryTimes[__knexQueryUid];
    });
    return conn;
}

// for backward compatibility
module.exports = {
    createDb,
};
