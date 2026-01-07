import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../types/option.js';
import type { IUnleashServices } from '../services/index.js';

import Controller from './controller.js';
import { NONE } from '../types/permissions.js';
import { createResponseSchema } from '../openapi/util/create-response-schema.js';
import type { HealthCheckSchema } from '../openapi/spec/health-check-schema.js';

export class HealthCheckController extends Controller {
    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
    ) {
        super(config);

        this.route({
            method: 'get',
            path: '',
            handler: this.getHealth,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Operational'],
                    operationId: 'getHealth',
                    summary: 'Get instance operational status',
                    description:
                        'This operation returns information about whether this Unleash instance is healthy and ready to serve requests or not. Typically used by your deployment orchestrator (e.g. Kubernetes, Docker Swarm, Mesos, et al.).',
                    responses: {
                        200: createResponseSchema('healthCheckSchema'),
                        500: createResponseSchema('healthCheckSchema'),
                    },
                }),
            ],
        });
    }

    async getHealth(
        _: Request,
        res: Response<HealthCheckSchema>,
    ): Promise<void> {
        res.status(200).json({ health: 'GOOD' });
    }
}
