import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../types/option.js';
import type { IUnleashServices } from '../services/index.js';
import type { Db } from '../db/db.js';
import type { Logger } from '../logger.js';

import Controller from './controller.js';
import { NONE } from '../types/permissions.js';
import { createResponseSchema } from '../openapi/util/create-response-schema.js';
import type { ReadyCheckSchema } from '../openapi/spec/ready-check-schema.js';

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
                        500: createResponseSchema('readyCheckSchema'),
                    },
                }),
            ],
        });
    }

    async getReady(_: Request, res: Response<ReadyCheckSchema>): Promise<void> {
        if (this.config.checkDbOnReady && this.db) {
            try {
                await this.db.raw('select 1');
                res.status(200).json({ health: 'GOOD' });
                return;
            } catch (err: any) {
                this.logger.warn('Database readiness check failed', err);
                res.status(500).json({ health: 'BAD' });
                return;
            }
        }

        res.status(200).json({ health: 'GOOD' });
    }
}
