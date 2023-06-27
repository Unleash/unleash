import { IUnleashConfig, IUnleashServices } from 'lib/types';
import Controller from '../controller';
import { Logger } from '../../logger';
import { NONE } from '../../types/permissions';
import { IAuthRequest } from '../unleash-types';
import { Response } from 'express';
import { FeedbackService } from 'lib/services';

export default class FeedbackController extends Controller {
    logger: Logger;

    feedbackService: FeedbackService;

    constructor(
        { feedbackService }: Pick<IUnleashServices, 'feedbackService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        this.feedbackService = feedbackService;
        const { getLogger } = config;
        this.logger = getLogger('/api/client/feedback');

        this.route({
            method: 'post',
            path: '',
            handler: this.receiveFeatureFeedback,
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

    async receiveFeatureFeedback(
        req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        const { body: data } = req;
        const { featureName, requestHash, payload } = data;

        await this.feedbackService.createFeatureFeedback({
            featureName,
            contextHash: requestHash,
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
