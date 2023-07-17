import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { NONE } from '../../types/permissions';
import Controller from '../../routes/controller';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { getStandardResponses } from '../../openapi/util/standard-responses';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { PlaygroundService } from './playground-service';
import { IFlagResolver } from '../../types';
import { AdvancedPlaygroundRequestSchema } from '../../openapi/spec/advanced-playground-request-schema';
import { AdvancedPlaygroundResponseSchema } from '../../openapi/spec/advanced-playground-response-schema';
import { advancedPlaygroundViewModel } from './playground-view-model';

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
                    description:
                        'Use the provided `context`, `environments`, and `projects` to evaluate toggles on this Unleash instance. You can use comma-separated values to provide multiple values to each context field. Returns a combinatorial list of all toggles that match the parameters and what they evaluate to. The response also contains the input parameters that were provided.',
                    summary:
                        'Batch evaluate an Unleash context against a set of environments and projects.',
                }),
            ],
        });
    }

    async evaluateAdvancedContext(
        req: Request<any, any, AdvancedPlaygroundRequestSchema>,
        res: Response<AdvancedPlaygroundResponseSchema>,
    ): Promise<void> {
        const { payload } = this.flagResolver.getVariant('advancedPlayground');
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
    }
}
