import { Request, Response } from 'express';
import { IUnleashConfig } from '../types/option';
import { IUnleashServices } from '../types/services';
import { Logger } from '../logger';
import { OpenApiService } from '../services/openapi-service';

import Controller from './controller';
import { NONE } from '../types/permissions';
import { createResponseSchema } from '../openapi/util/create-response-schema';
import { HealthCheckSchema } from '../openapi/spec/health-check-schema';

export class HealthCheckController extends Controller {
    private logger: Logger;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('health-check.js');
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getHealth,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Operational'],
                    operationId: 'getHealth',
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
