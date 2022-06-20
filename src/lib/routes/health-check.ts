import { Request, Response } from 'express';
import { IUnleashConfig } from '../types/option';
import { IUnleashServices } from '../types/services';
import { Logger } from '../logger';
import HealthService from '../services/health-service';
import { OpenApiService } from '../services/openapi-service';

import Controller from './controller';
import { NONE } from '../types/permissions';
import { createResponseSchema } from '../openapi';
import { HealthCheckSchema } from '../openapi/spec/health-check-schema';

export class HealthCheckController extends Controller {
    private logger: Logger;

    private openApiService: OpenApiService;

    private healthService: HealthService;

    constructor(
        config: IUnleashConfig,
        {
            healthService,
            openApiService,
        }: Pick<IUnleashServices, 'healthService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('health-check.js');
        this.openApiService = openApiService;
        this.healthService = healthService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getHealth,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['other'],
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
        try {
            await this.healthService.dbIsUp();
            res.status(200).json({ health: 'GOOD' });
        } catch (e) {
            this.logger.error('Could not select from features, error was: ', e);
            res.status(500).json({ health: 'BAD' });
        }
    }
}
