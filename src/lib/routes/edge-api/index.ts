import { Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig, IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import { NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { RequestBody } from '../unleash-types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    validateEdgeTokensSchema,
    ValidateEdgeTokensSchema,
} from '../../openapi/spec/validate-edge-tokens-schema';
import EdgeService from '../../services/edge-service';
import { OpenApiService } from '../../services/openapi-service';
import { emptyResponse } from '../../openapi/util/standard-responses';
import { BulkMetricsSchema } from '../../openapi/spec/bulk-metrics-schema';
import ClientMetricsServiceV2 from '../../services/client-metrics/metrics-service-v2';

export default class EdgeController extends Controller {
    private readonly logger: Logger;

    private edgeService: EdgeService;

    private openApiService: OpenApiService;

    private metricsV2: ClientMetricsServiceV2;

    constructor(
        config: IUnleashConfig,
        {
            edgeService,
            openApiService,
            clientMetricsServiceV2,
        }: Pick<
            IUnleashServices,
            'edgeService' | 'openApiService' | 'clientMetricsServiceV2'
        >,
    ) {
        super(config);
        this.logger = config.getLogger('edge-api/index.ts');
        this.edgeService = edgeService;
        this.openApiService = openApiService;
        this.metricsV2 = clientMetricsServiceV2;

        this.route({
            method: 'post',
            path: '/validate',
            handler: this.getValidTokens,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Edge'],
                    operationId: 'getValidTokens',
                    requestBody: createRequestSchema(
                        'validateEdgeTokensSchema',
                    ),
                    responses: {
                        200: createResponseSchema('validateEdgeTokensSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/metrics',
            handler: this.bulkMetrics,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Edge'],
                    operationId: 'bulkMetrics',
                    requestBody: createRequestSchema('bulkMetricsSchemaSchema'),
                    responses: {
                        202: emptyResponse,
                    },
                }),
            ],
        });
    }

    async getValidTokens(
        req: RequestBody<ValidateEdgeTokensSchema>,
        res: Response<ValidateEdgeTokensSchema>,
    ): Promise<void> {
        const tokens = await this.edgeService.getValidTokens(
            req.body.tokens as string[],
        );
        this.openApiService.respondWithValidation<ValidateEdgeTokensSchema>(
            200,
            res,
            validateEdgeTokensSchema.$id,
            tokens,
        );
    }

    async bulkMetrics(
        req: RequestBody<BulkMetricsSchema>,
        res: Response<void>,
    ): Promise<void> {
        const { metrics, applications } = req.body;

        try {
            // for (const app in applications) {

            // }
            await this.metricsV2.registerBulkMetrics(metrics);
            res.status(202).end();
        } catch (e) {
            res.status(400).end();
        }
    }
}
