import { IUnleashConfig } from 'lib/types';
import Controller from '../controller';
import { Logger } from '../../logger';
import { NONE } from '../../types/permissions';
import { IAuthRequest } from '../unleash-types';
import { Response } from 'express';

export default class FeedbackController extends Controller {
    logger: Logger;

    constructor(config: IUnleashConfig) {
        super(config);
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
    }

    async receiveFeatureFeedback(
        req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        const { body: data } = req;
        const { featureName, requestHash, payload } = data;
        console.info(featureName);
        console.info(requestHash);
        console.info(payload);
        res.status(202).end();
    }
}
