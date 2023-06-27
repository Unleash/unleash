import Controller from '../controller';
import { OpenApiService } from '../../services/openapi-service';
import { Logger } from '../../logger';
import { NONE } from '../../types/permissions';
import { IUnleashConfig, IUnleashServices } from 'lib/types';
import { IAuthRequest } from '../unleash-types';
import { Response } from 'express';
import { FeedbackService } from 'lib/services';

export class FeatureFeedbackController extends Controller {
    private openApiService: OpenApiService;

    private logger: Logger;

    feedbackService: FeedbackService;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            feedbackService,
        }: Pick<IUnleashServices, 'openApiService' | 'feedbackService'>,
    ) {
        super(config);
        const { getLogger } = config;
        this.openApiService = openApiService;
        this.logger = getLogger('/api/admin/featurefeedback');
        this.feedbackService = feedbackService;

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

    async getFeedbackForFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response,
    ): Promise<void> {
        const name = req.params.featureName;
        const feedback = await this.feedbackService.getFeedbackForFeature(name);
        res.status(200).json(feedback);
    }
}

module.exports = FeatureFeedbackController;
export default FeatureFeedbackController;
