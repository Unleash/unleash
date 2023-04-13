import { Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig, IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import { NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { IAuthRequest, RequestBody } from '../unleash-types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    validateEdgeTokensSchema,
    ValidateEdgeTokensSchema,
} from '../../openapi/spec/validate-edge-tokens-schema';
import ClientInstanceService from '../../services/client-metrics/instance-service';
import EdgeService from '../../services/edge-service';
import { OpenApiService } from '../../services/openapi-service';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import { BulkMetricsSchema } from '../../openapi/spec/bulk-metrics-schema';
import ClientMetricsServiceV2 from '../../services/client-metrics/metrics-service-v2';
import { clientMetricsEnvBulkSchema } from '../../services/client-metrics/schema';
import { TokenStringListSchema } from '../../openapi';

export default class EdgeController extends Controller {
    private readonly logger: Logger;

    private edgeService: EdgeService;

    private openApiService: OpenApiService;

    private metricsV2: ClientMetricsServiceV2;

    private clientInstanceService: ClientInstanceService;

    constructor(
        config: IUnleashConfig,
        {
            edgeService,
            openApiService,
            clientMetricsServiceV2,
            clientInstanceService,
        }: Pick<
            IUnleashServices,
            | 'edgeService'
            | 'openApiService'
            | 'clientMetricsServiceV2'
            | 'clientInstanceService'
        >,
    ) {
        super(config);
        this.logger = config.getLogger('edge-api/index.ts');
        this.edgeService = edgeService;
        this.openApiService = openApiService;
        this.metricsV2 = clientMetricsServiceV2;
        this.clientInstanceService = clientInstanceService;

        this.route({
            method: 'post',
            path: '/validate',
            handler: this.getValidTokens,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Edge'],
                    summary: 'Filter a list of tokens returning only the valid ones',
                    description:
                        'Accepts a list of tokens, and returns those that are valid with the projects they can access',
                    operationId: 'getValidTokens',
                    requestBody: createRequestSchema('tokenStringListSchema'),
                    responses: {
                        200: createResponseSchema('validateEdgeTokensSchema'),
                        ...getStandardResponses(400),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/metrics',
            handler: this.bulkMetrics,
            permission: NONE, // should have a permission but not bound to any environment
            middleware: [
                this.openApiService.validPath({
                    tags: ['Edge'],
                    summary:
                        'Accepts batched metrics from Edge, for insertion into our metrics storage',
                    operationId: 'bulkMetrics',
                    requestBody: createRequestSchema('bulkMetricsSchema'),
                    responses: {
                        202: emptyResponse,
                        ...getStandardResponses(400),
                    },
                }),
            ],
        });
    }

    async getValidTokens(
        req: RequestBody<TokenStringListSchema>,
        res: Response<ValidateEdgeTokensSchema>,
    ): Promise<void> {
        const tokens = await this.edgeService.getValidTokens(req.body.tokens);
        this.openApiService.respondWithValidation<ValidateEdgeTokensSchema>(
            200,
            res,
            validateEdgeTokensSchema.$id,
            tokens,
        );
    }

    async bulkMetrics(
        req: IAuthRequest<void, void, BulkMetricsSchema>,
        res: Response<void>,
    ): Promise<void> {
        const { body, ip: clientIp } = req;
        const { metrics, applications } = body;

        try {
            let promises: Promise<void>[] = [];
            for (const app of applications) {
                promises.push(
                    this.clientInstanceService.registerClient(app, clientIp),
                );
            }
            if (metrics && metrics.length > 0) {
                const data = await clientMetricsEnvBulkSchema.validateAsync(
                    metrics,
                );
                promises.push(this.metricsV2.registerBulkMetrics(data));
            }
            await Promise.all(promises);
            res.status(202).end();
        } catch (e) {
            res.status(400).end();
        }
    }
}
