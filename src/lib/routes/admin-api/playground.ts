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
                        ...getStandardResponses(401),
                        200: createResponseSchema('playgroundResponseSchema'),
                    },
                    requestBody: createRequestSchema('playgroundRequestSchema'),
                    ...endpointDescriptions.admin.playground,
                }),
            ],
        });
    }

    async evaluateContext(req: Request<{}>, res: Response): Promise<void> {
        console.log(req, res);

        return null;
    }

    // async getEventsForToggle(
    //     req: Request<{ featureName: string }>,
    //     res: Response<FeatureEventsSchema>,
    // ): Promise<void> {
    //     const toggleName = req.params.featureName;
    //     const events = await this.eventService.getEventsForToggle(toggleName);

    //     const response = {
    //         version,
    //         toggleName,
    //         events: serializeDates(this.fixEvents(events)),
    //     };

    //     this.openApiService.respondWithValidation(
    //         200,
    //         res,
    //         featureEventsSchema.$id,
    //         response,
    //     );
    // }
}
