import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { NONE } from '../../types/permissions';
import Controller from '../controller';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
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
                    description:
                        'Use the provided `context`, `environment`, and `projects` to evaluate toggles on this Unleash instance. Returns a list of all toggles that match the parameters and what they evaluate to. The response also contains the input parameters that were provided.',
                    summary:
                        'Evaluate an Unleash context against a set of environments and projects.',
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
