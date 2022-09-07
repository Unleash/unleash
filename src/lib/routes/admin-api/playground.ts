import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { NONE } from '../../types/permissions';
import Controller from '../controller';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { endpointDescriptions } from '../../openapi/endpoint-descriptions';
import { getStandardResponses } from '../../../lib/openapi/util/standard-responses';
import { createRequestSchema } from '../../../lib/openapi/util/create-request-schema';
import {
    PlaygroundResponseSchema,
    playgroundResponseSchema,
} from '../../../lib/openapi/spec/playground-response-schema';
import { PlaygroundRequestSchema } from '../../../lib/openapi/spec/playground-request-schema';
import { PlaygroundService } from '../../../lib/services/playground-service';

export default class PlaygroundController extends Controller {
    private openApiService: OpenApiService;

    private playgroundService: PlaygroundService;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            playgroundService,
        }: Pick<IUnleashServices, 'openApiService' | 'playgroundService'>,
    ) {
        super(config);
        this.openApiService = openApiService;
        this.playgroundService = playgroundService;

        this.route({
            method: 'post',
            path: '',
            handler: this.evaluateContext,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getPlayground',
                    tags: ['Playground'],
                    responses: {
                        ...getStandardResponses(400, 401),
                        200: createResponseSchema('playgroundResponseSchema'),
                    },
                    requestBody: createRequestSchema('playgroundRequestSchema'),
                    ...endpointDescriptions.admin.playground,
                }),
            ],
        });
    }

    async evaluateContext(
        req: Request<any, any, PlaygroundRequestSchema>,
        res: Response<PlaygroundResponseSchema>,
    ): Promise<void> {
        const response = {
            input: req.body,
            features: await this.playgroundService.evaluateQuery(
                req.body.projects,
                req.body.environment,
                req.body.context,
            ),
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            playgroundResponseSchema.$id,
            response,
        );
    }
}
