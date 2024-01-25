import { Response } from 'express';
import Controller from '../controller';
import { IFlagResolver, IUnleashConfig, IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import { NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { IAuthRequest, RequestBody } from '../unleash-types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    validatedEdgeTokensSchema,
    ValidatedEdgeTokensSchema,
} from '../../openapi/spec/validated-edge-tokens-schema';
import ClientInstanceService from '../../features/metrics/instance/instance-service';
import EdgeService from '../../services/edge-service';
import { OpenApiService } from '../../services/openapi-service';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import { BulkMetricsSchema } from '../../openapi/spec/bulk-metrics-schema';
import ClientMetricsServiceV2 from '../../features/metrics/client-metrics/metrics-service-v2';
import { clientMetricsEnvBulkSchema } from '../../features/metrics/shared/schema';
import { TokenStringListSchema } from '../../openapi';

export default class EdgeController extends Controller {
    private readonly logger: Logger;

    private edgeService: EdgeService;

    private openApiService: OpenApiService;

    private metricsV2: ClientMetricsServiceV2;

    private clientInstanceService: ClientInstanceService;

    private flagResolver: IFlagResolver;

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
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'post',
            path: '/validate',
            handler: this.getValidTokens,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Edge'],
                    security: [{}],
                    summary: 'Check which tokens are valid',
                    description:
                        'This operation accepts a list of tokens to validate. Unleash will validate each token you provide. For each valid token you provide, Unleash will return the token along with its type and which projects it has access to.',
                    operationId: 'getValidTokens',
                    requestBody: createRequestSchema('tokenStringListSchema'),
                    responses: {
                        200: createResponseSchema('validatedEdgeTokensSchema'),
                        ...getStandardResponses(400, 413, 415),
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
                    summary: 'Send metrics from Edge',
                    description: `This operation accepts batched metrics from Edge. Metrics will be inserted into Unleash's metrics storage`,
                    operationId: 'bulkMetrics',
                    requestBody: createRequestSchema('bulkMetricsSchema'),
                    responses: {
                        202: emptyResponse,
                        ...getStandardResponses(400, 413, 415),
                    },
                }),
            ],
        });
    }

    async getValidTokens(
        req: RequestBody<TokenStringListSchema>,
        res: Response<ValidatedEdgeTokensSchema>,
    ): Promise<void> {
        const tokens = await this.edgeService.getValidTokens(req.body.tokens);
        this.openApiService.respondWithValidation<ValidatedEdgeTokensSchema>(
            200,
            res,
            validatedEdgeTokensSchema.$id,
            tokens,
        );
    }

    async bulkMetrics(
        req: IAuthRequest<void, void, BulkMetricsSchema>,
        res: Response<void>,
    ): Promise<void> {
        if (this.flagResolver.isEnabled('edgeBulkMetrics')) {
            const { body, ip: clientIp } = req;
            const { metrics, applications } = body;

            try {
                const promises: Promise<void>[] = [];
                for (const app of applications) {
                    promises.push(
                        this.clientInstanceService.registerClient(
                            app,
                            clientIp,
                        ),
                    );
                }
                if (metrics && metrics.length > 0) {
                    const data =
                        await clientMetricsEnvBulkSchema.validateAsync(metrics);
                    promises.push(this.metricsV2.registerBulkMetrics(data));
                }
                await Promise.all(promises);
                res.status(202).end();
            } catch (e) {
                res.status(400).end();
            }
        } else {
            // @ts-expect-error Expected result here is void, but since we want to communicate extra information in our 404, we allow this to avoid type-checking
            res.status(404).json({
                status: 'disabled',
                reason: 'disabled by killswitch',
                help: 'You should upgrade Edge to the most recent version to not lose metrics',
            });
        }
    }
}
