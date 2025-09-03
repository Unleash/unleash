import type { Knex } from 'knex';
import knexpkg from 'knex';
const { knex } = knexpkg;
import type { IUnleashConfig } from '../types/option.js';

import { Signer } from '@aws-sdk/rds-signer';

export function createDb({
    db,
    getLogger,
}: Pick<IUnleashConfig, 'db' | 'getLogger'>): Knex {
    const logger = getLogger('db-pool.js');

    const {
        host,
        port,
        user,
        database,
        ssl,
        applicationName,
        password,
        awsIamAuth,
        awsRegion,
        pool,
    } = db;

    let resolvedPassword: string | (() => Promise<string>) | undefined =
        password;

    if (awsIamAuth) {
        if (!awsRegion) {
            throw new Error(
                'AWS_REGION is required when DATABASE_AWS_IAM=true',
            );
        }
        const signer = new Signer({
            region: awsRegion,
            hostname: host,
            port: Number(port ?? 5432),
            username: user,
        });

        resolvedPassword = async () => signer.getAuthToken();
    }

    const connection = {
        host,
        port,
        user,
        database,
        ssl,
        application_name: applicationName,
        password: resolvedPassword,
    };

    return knex({
        client: 'pg',
        version: db.version,
        connection,
        pool,
        searchPath: db.schema,
        asyncStackTraces: true,
        log: {
            debug: (msg) => logger.debug(msg),
            warn: (msg) => logger.warn(msg),
            error: (msg) => logger.error(msg),
        },
    });
}
