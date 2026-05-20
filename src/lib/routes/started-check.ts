import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../types/option.js';
import type { IUnleashServices } from '../services/index.js';

import Controller from './controller.js';
import { NONE } from '../types/permissions.js';
import { createResponseSchema } from '../openapi/util/create-response-schema.js';
import type { StartedCheckSchema } from '../openapi/spec/started-check-schema.js';
import { emptyResponse } from '../server-impl.js';
import type { FrontendApiService } from '../features/frontend-api/frontend-api-service.js';

export class StartedCheckController extends Controller {
    private frontendApiService: FrontendApiService;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            frontendApiService,
        }: Pick<IUnleashServices, 'openApiService' | 'frontendApiService'>,
    ) {
        super(config);
        this.frontendApiService = frontendApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getStarted,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Operational'],
                    operationId: 'getStarted',
                    summary: 'Get instance startup status',
                    description:
                        'This operation returns information about whether this Unleash instance has completed startup (initial cache warming) and is ready to serve traffic. Typically used as a Kubernetes startup probe.',
                    responses: {
                        200: createResponseSchema('startedCheckSchema'),
                        503: emptyResponse,
                    },
                }),
            ],
        });
    }

    async getStarted(
        _: Request,
        res: Response<StartedCheckSchema>,
    ): Promise<void> {
        if (this.frontendApiService.isCacheReady()) {
            res.status(200).json({ health: 'GOOD' });
        } else {
            res.status(503).end();
        }
    }
}
