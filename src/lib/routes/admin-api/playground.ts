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

export default class PlaygroundController extends Controller {
    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
    ) {
        super(config);
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '',
            handler: this.evaluateContext,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getPlayground',
                    tags: ['admin'],
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
        const response: PlaygroundResponseSchema = {
            input: req.body,
            toggles: [],
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            playgroundResponseSchema.$id,
            response,
        );
    }

    // async doWork(
    //     toggles: FeatureToggle,
    //     parameters: PlaygroundRequestSchema
    // ) : Promise<> =>
}
