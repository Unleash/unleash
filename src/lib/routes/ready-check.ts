import type { Request, Response } from 'express';
import type { PoolClient } from 'pg';
import type { IUnleashConfig } from '../types/option.js';
import type { IUnleashServices } from '../services/index.js';
import type { Db } from '../db/db.js';
import type { Logger } from '../logger.js';

import Controller from './controller.js';
import { NONE } from '../types/permissions.js';
import { createResponseSchema } from '../openapi/util/create-response-schema.js';
import type { ReadyCheckSchema } from '../openapi/spec/ready-check-schema.js';
import { emptyResponse, parseEnvVarNumber } from '../server-impl.js';

export class ReadyCheckController extends Controller {
    private logger: Logger;

    private db?: Db;

    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
        db?: Db,
    ) {
        super(config);
        this.logger = config.getLogger('ready-check.js');
        this.db = db;

        this.route({
            method: 'get',
            path: '',
            handler: this.getReady,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Operational'],
                    operationId: 'getReady',
                    summary: 'Get instance readiness status',
                    description:
                        'This operation returns information about whether this Unleash instance is ready to serve requests or not. Typically used by your deployment orchestrator (e.g. Kubernetes, Docker Swarm, Mesos, et al.).',
                    responses: {
                        200: createResponseSchema('readyCheckSchema'),
                        503: emptyResponse,
                    },
                }),
            ],
        });
    }

    async getReady(_: Request, res: Response<ReadyCheckSchema>): Promise<void> {
        if (this.config.checkDbOnReady && this.db) {
            try {
                const timeoutMs = parseEnvVarNumber(
                    process.env.DATABASE_STATEMENT_TIMEOUT_MS,
                    200,
                );

                await this.runReadinessQuery(timeoutMs);
                res.status(200).json({ health: 'GOOD' });
                return;
            } catch (err: any) {
                this.logger.warn('Database readiness check failed', err);
                res.status(503).end();
                return;
            }
        }

        res.status(200).json({ health: 'GOOD' });
    }

    private async runReadinessQuery(timeoutMs: number): Promise<void> {
        const client = getKnexClient(this.db!);
        const pendingAcquire = client.pool.acquire();

        const abortDelay = setTimeout(() => pendingAcquire.abort(), timeoutMs);
        let connection: PoolClient | undefined;

        try {
            connection = (await pendingAcquire.promise) as PoolClient;
        } finally {
            clearTimeout(abortDelay);
        }

        try {
            await connection.query('BEGIN');
            await connection.query({
                text: `SET LOCAL statement_timeout = ${timeoutMs}`,
            });
            await connection.query('SELECT 1');
            await connection.query('COMMIT');
        } catch (error) {
            try {
                await connection.query('ROLLBACK');
            } catch (rollbackError) {
                this.logger.debug(
                    'Failed to rollback readiness timeout transaction',
                    rollbackError,
                );
            }
            throw error;
        } finally {
            if (connection) {
                await client.releaseConnection(connection);
            }
        }
    }
}

function getKnexClient(db: Db): Db['client'] {
    if (db.client?.pool && typeof db.client.releaseConnection === 'function') {
        return db.client as Db['client'];
    }

    throw new Error('Unsupported database handle for readiness check');
}
