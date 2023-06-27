import { IUnleashConfig, IUnleashServices } from 'lib/types';
import Controller from '../controller';
import { Logger } from '../../logger';
import { NONE } from '../../types/permissions';
import { IAuthRequest } from '../unleash-types';
import { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import { Response } from 'express';
import { FeedbackService } from 'lib/services';

export default class FeedbackController extends Controller {
    logger: Logger;

    feedbackService: FeedbackService;

    openApiService: OpenApiService;

    constructor(
        {
            feedbackService,
            openApiService,
        }: Pick<IUnleashServices, 'feedbackService' | 'openApiService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        this.feedbackService = feedbackService;
        const { getLogger } = config;
        this.logger = getLogger('/api/client/feedback');

        this.route({
            method: 'post',
            path: '',
            handler: this.registerFeatureFeedback,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Feedback'],
                    summary: 'Register user feature feedback.',
                    description: `Registers user feature feedback. Stores information on when a feedback was registered, what the feedback was, feature info.`,
                    operationId: 'registerFeatureFeedback',
                    requestBody: createRequestSchema(
                        'registerFeatureFeedbackSchema',
                    ),
                    responses: {
                        ...getStandardResponses(400),
                        202: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:featureName',
            handler: this.getFeedbackForFeature,
            permission: NONE,
            // middleware: [
            //     openApiService.validPath({
            //         tags: ['Client'],
            //         summary: 'Register client usage metrics',
            //         description: `Registers usage metrics. Stores information about how many times each toggle was evaluated to enabled and disabled within a time frame. If provided, this operation will also store data on how many times each feature toggle's variants were displayed to the end user.`,
            //         operationId: 'registerClientMetrics',
            //         requestBody: createRequestSchema('clientMetricsSchema'),
            //         responses: {
            //             ...getStandardResponses(400),
            //             202: emptyResponse,
            //         },
            //     }),
            // ],
        });
    }

    async registerFeatureFeedback(
        req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        const { body: data } = req;
        const { featureName, contextHash, payload } = data;

        await this.feedbackService.createFeatureFeedback({
            featureName,
            contextHash,
            metadata: {},
            payload,
        });

        res.status(202).end();
    }

    async getFeedbackForFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response,
    ): Promise<void> {
        const name = req.params.featureName;
        const feedback = await this.feedbackService.getFeedbackForFeature(name);
        res.status(200).json(feedback);
    }
}
