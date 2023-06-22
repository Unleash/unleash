import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { NONE } from '../../types/permissions';
import Controller from '../../routes/controller';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { endpointDescriptions } from '../../openapi/endpoint-descriptions';
import { getStandardResponses } from '../../openapi/util/standard-responses';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    PlaygroundResponseSchema,
    playgroundResponseSchema,
} from '../../openapi/spec/playground-response-schema';
import { PlaygroundRequestSchema } from '../../openapi/spec/playground-request-schema';
import { PlaygroundService } from './playground-service';
import { IFlagResolver } from '../../types';
import { AdvancedPlaygroundRequestSchema } from '../../openapi/spec/advanced-playground-request-schema';
import { AdvancedPlaygroundResponseSchema } from '../../openapi/spec/advanced-playground-response-schema';
import {
    advancedPlaygroundViewModel,
    playgroundViewModel,
} from './playground-view-model';

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
                    ...endpointDescriptions.admin.playground,
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
                    tags: ['Unstable'],
                    responses: {
                        ...getStandardResponses(400, 401),
                        200: createResponseSchema(
                            'advancedPlaygroundResponseSchema',
                        ),
                    },
                    requestBody: createRequestSchema(
                        'advancedPlaygroundRequestSchema',
                    ),
                    ...endpointDescriptions.admin.advancedPlayground,
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
        req: Request<any, any, AdvancedPlaygroundRequestSchema>,
        res: Response<AdvancedPlaygroundResponseSchema>,
    ): Promise<void> {
        if (this.flagResolver.isEnabled('advancedPlayground')) {
            const { payload } =
                this.flagResolver.getVariant('advancedPlayground');
            const limit =
                payload?.value && Number.isInteger(parseInt(payload?.value))
                    ? parseInt(payload?.value)
                    : 15000;

            const result = await this.playgroundService.evaluateAdvancedQuery(
                req.body.projects || '*',
                req.body.environments,
                req.body.context,
                limit,
            );

            const response: AdvancedPlaygroundResponseSchema =
                advancedPlaygroundViewModel(req.body, result);

            res.json(response);
        } else {
            res.status(409).end();
        }
    }
}
