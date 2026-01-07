import type { Response } from 'express';
import Controller from '../controller.js';
import type { IUnleashConfig } from '../../types/index.js';
import type { Logger } from '../../logger.js';
import { NONE } from '../../types/permissions.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import type { RequestBody } from '../unleash-types.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import {
    validatedEdgeTokensSchema,
    type ValidatedEdgeTokensSchema,
} from '../../openapi/spec/validated-edge-tokens-schema.js';
import type EdgeService from '../../services/edge-service.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { getStandardResponses } from '../../openapi/util/standard-responses.js';
import type { TokenStringListSchema } from '../../openapi/index.js';
import type { IUnleashServices } from '../../services/index.js';

export default class EdgeController extends Controller {
    private readonly logger: Logger;

    private edgeService: EdgeService;

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
            handler: this.getValidTokens,
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
}
