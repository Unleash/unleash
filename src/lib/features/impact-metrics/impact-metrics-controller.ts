import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { IUnleashConfig } from '../../types/option.js';
import { NONE } from '../../types/permissions.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { getStandardResponses } from '../../openapi/util/standard-responses.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import type ImpactMetricsService from './impact-metrics-service.js';
import {
    impactMetricsSchema,
    type ImpactMetricsSchema,
} from '../../openapi/spec/impact-metrics-schema.js';

interface ImpactMetricsServices {
    impactMetricsService: ImpactMetricsService;
    openApiService: OpenApiService;
}

export default class ImpactMetricsController extends Controller {
    private impactMetricsService: ImpactMetricsService;
    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        { impactMetricsService, openApiService }: ImpactMetricsServices,
    ) {
        super(config);
        this.impactMetricsService = impactMetricsService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getImpactMetrics,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'getImpactMetrics',
                    summary: 'Get impact metrics',
                    description:
                        'Retrieves impact metrics data from Prometheus and forwards it to the frontend.',
                    responses: {
                        200: createResponseSchema('impactMetricsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getImpactMetrics(
        req: IAuthRequest,
        res: Response<ImpactMetricsSchema>,
    ): Promise<void> {
        const metrics =
            await this.impactMetricsService.getMetricsFromPrometheus();

        this.openApiService.respondWithValidation(
            200,
            res,
            impactMetricsSchema.$id,
            metrics,
        );
    }
}
