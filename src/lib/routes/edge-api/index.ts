import type { Response } from 'express';
import Controller from '../controller.js';
import type { IUnleashConfig } from '../../types/index.js';
import type { Logger } from '../../logger.js';
import { NONE } from '../../types/index.js';
import { createResponseSchema } from '../../openapi/index.js';
import type { RequestBody } from '../unleash-types.js';
import { createRequestSchema } from '../../openapi/index.js';
import {
    validatedEdgeTokensSchema,
    type ValidatedEdgeTokensSchema,
} from '../../openapi/index.js';
import type EdgeService from '../../services/edge-service.js';
import type { OpenApiService } from '../../services/index.js';
import { getStandardResponses } from '../../openapi/index.js';
import type {
    EdgeEnvironmentsProjectsListSchema,
    TokenStringListSchema,
} from '../../openapi/index.js';
import type { IUnleashServices } from '../../services/index.js';
import { hmacSignatureVerifyTokenRequest } from '../../features/edgetokens/edge-hmac-verifier.js';
import type { WithTransactional } from '../../db/transaction.js';

export default class EdgeController extends Controller {
    private readonly logger: Logger;

    private edgeService: WithTransactional<EdgeService>;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            edgeService,
            openApiService,
        }: Pick<IUnleashServices, 'edgeService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('edge-api/index.ts');
        this.edgeService = edgeService;
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validateTokens,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Unleash Edge'],
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
            path: '/issue-token',
            handler: this.createOrReturnTokens,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Unleash Edge'],
                    security: [{}],
                    summary:
                        'Get or create valid tokens for the requested environment',
                    description:
                        'This operation accepts a list of environments/project pairs to return tokens for. If they do not exist, Unleash will generate them',
                    operationId: 'edgeCreateOrReturnTokens',
                    requestBody: createRequestSchema(
                        'edgeEnvironmentProjectsListSchema',
                    ),
                    responses: {
                        200: createResponseSchema('validatedEdgeTokensSchema'),
                        ...getStandardResponses(400, 403, 413, 415),
                    },
                }),
                hmacSignatureVerifyTokenRequest(edgeService),
            ],
        });
    }

    async validateTokens(
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

    async createOrReturnTokens(
        req: RequestBody<EdgeEnvironmentsProjectsListSchema>,
        res: Response<ValidatedEdgeTokensSchema>,
    ): Promise<void> {
        const tokens = await this.edgeService.transactional((svc) => {
            return svc.getOrCreateTokens(res.locals.clientId, req.body);
        });
        res.status(200).json(tokens);
    }
}
