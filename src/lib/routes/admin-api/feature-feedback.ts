import Controller from '../controller';
import { OpenApiService } from '../../services/openapi-service';
import { Logger } from '../../logger';
import { NONE } from '../../types/permissions';
import { IUnleashConfig, IUnleashServices, serializeDates } from '../../types';
import { IAuthRequest } from '../unleash-types';
import { Response } from 'express';
import { FeedbackService } from '../../services';
import { createResponseSchema, getFeatureFeedbackSchema } from '../../openapi';

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
            middleware: [
                openApiService.validPath({
                    tags: ['Feedback'],
                    operationId: 'getFeatureFeedback',
                    responses: {
                        200: createResponseSchema('getFeatureFeedbackSchema'),
                    },
                }),
            ],
        });
    }

    async getFeedbackForFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response,
    ): Promise<void> {
        const name = req.params.featureName;
        const feedback = await this.feedbackService.getFeedbackForFeature(name);

        this.openApiService.respondWithValidation(
            200,
            res,
            getFeatureFeedbackSchema.$id,
            serializeDates(feedback),
        );
    }
}

module.exports = FeatureFeedbackController;
export default FeatureFeedbackController;
