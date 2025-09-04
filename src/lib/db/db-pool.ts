import type { Knex } from 'knex';
import knexpkg from 'knex';
const { knex } = knexpkg;
import type { IUnleashConfig } from '../types/option.js';
import { getDBPasswordResolver } from './aws-iam.js';

export function createDb({
    db,
    getLogger,
}: Pick<IUnleashConfig, 'db' | 'getLogger'>): Knex {
    const logger = getLogger('db-pool.js');

    logger.info(
        `createDb: iam=${Boolean(db.awsIamAuth)} host=${db.host} port=${db.port} db=${db.database} user=${process.env.DATABASE_USERNAME || db.user} ssl=${Boolean(db.ssl)}`,
    );

    const { password, ...logDb } = db;
    logger.info(`createDb (DB): ${JSON.stringify(logDb, undefined, 2)}`);

    return knex({
        client: 'pg',
        version: db.version,
        connection: {
            ...db,
            user: process.env.DATABASE_USERNAME || db.user,
            application_name: db.applicationName,
            password: getDBPasswordResolver(db),
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
