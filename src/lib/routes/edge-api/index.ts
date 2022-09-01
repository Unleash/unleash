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
}
