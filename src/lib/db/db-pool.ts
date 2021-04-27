'use strict';

import { Knex } from 'knex';
import { IUnleashConfig } from '../types/option';

const knex = require('knex');

export function createDb({
    db,
    getLogger,
}: Pick<IUnleashConfig, 'db' | 'getLogger'>): Knex {
    const logger = getLogger('db-pool.js');
    return knex({
        client: 'pg',
        version: db.version,
        connection: db,
        pool: db.pool,
        searchPath: db.schema,
        asyncStackTraces: true,
        log: {
            debug: msg => logger.debug(msg),
            info: msg => logger.info(msg),
            warn: msg => logger.warn(msg),
            error: msg => logger.error(msg),
        },
    });
}
module.exports = {
    createDb,
};
