import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import { NONE } from '../../types/permissions';
import Controller from '../../routes/controller';
import type { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { getStandardResponses } from '../../openapi/util/standard-responses';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    type PlaygroundResponseSchema,
    playgroundResponseSchema,
} from '../../openapi/spec/playground-response-schema';
import type { PlaygroundRequestSchema } from '../../openapi/spec/playground-request-schema';
import type { PlaygroundService } from './playground-service';
import type { IFlagResolver } from '../../types';
import type { AdvancedPlaygroundRequestSchema } from '../../openapi/spec/advanced-playground-request-schema';
import type { AdvancedPlaygroundResponseSchema } from '../../openapi/spec/advanced-playground-response-schema';
import {
    advancedPlaygroundViewModel,
    playgroundViewModel,
} from './playground-view-model';
import type { IAuthRequest } from '../../routes/unleash-types';
import { extractUserIdFromUser } from '../../util';

export default class PlaygroundController extends Controller {
    private openApiService: OpenApiService;

    private playgroundService: PlaygroundService;

    private flagResolver: IFlagResolver;

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
        this.flagResolver = config.flagResolver;

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
                        'Deprecated. Will be removed in the next Unleash major update. Use the provided `context`, `environment`, and `projects` to evaluate toggles on this Unleash instance. Returns a list of all toggles that match the parameters and what they evaluate to. The response also contains the input parameters that were provided.',
                    summary:
                        'Evaluate an Unleash context against a set of environments and projects.',
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/advanced',
            handler: this.evaluateAdvancedContext,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getAdvancedPlayground',
                    tags: ['Playground'],
                    responses: {
                        ...getStandardResponses(400, 401),
                        200: createResponseSchema(
                            'advancedPlaygroundResponseSchema',
                        ),
                    },
                    requestBody: createRequestSchema(
                        'advancedPlaygroundRequestSchema',
                    ),
                    description:
                        'Use the provided `context`, `environments`, and `projects` to evaluate toggles on this Unleash instance. You can use comma-separated values to provide multiple values to each context field. Returns a combinatorial list of all toggles that match the parameters and what they evaluate to. The response also contains the input parameters that were provided.',
                    summary:
                        'Batch evaluate an Unleash context against a set of environments and projects.',
                }),
            ],
        });
    }

    async evaluateContext(
        req: Request<any, any, PlaygroundRequestSchema>,
        res: Response<PlaygroundResponseSchema>,
    ): Promise<void> {
        const result = await this.playgroundService.evaluateQuery(
            req.body.projects || '*',
            req.body.environment,
            req.body.context,
        );
        const response: PlaygroundResponseSchema = playgroundViewModel(
            req.body,
            result,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            playgroundResponseSchema.$id,
            response,
        );
    }

    async evaluateAdvancedContext(
        req: IAuthRequest<any, any, AdvancedPlaygroundRequestSchema>,
        res: Response<AdvancedPlaygroundResponseSchema>,
    ): Promise<void> {
        const { user } = req;

        const { result, invalidContextProperties } =
            await this.playgroundService.evaluateAdvancedQuery(
                req.body.projects || '*',
                req.body.environments,
                req.body.context,
                extractUserIdFromUser(user),
            );

        const response: AdvancedPlaygroundResponseSchema =
            advancedPlaygroundViewModel(
                req.body,
                result,
                invalidContextProperties,
            );

        res.json(response);
    }
}
