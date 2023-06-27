import {
    IFeatureFeedback,
    IFeatureFeedbackStore,
    IUnleashConfig,
    IUnleashStores,
} from 'lib/types';
import { Logger } from '../logger';

class FeedbackService {
    private logger: Logger;

    private featureFeedbackStore: IFeatureFeedbackStore;

    constructor(
        { featureFeedbackStore }: Pick<IUnleashStores, 'featureFeedbackStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.featureFeedbackStore = featureFeedbackStore;
        this.logger = getLogger('services/feedback-service.ts');
    }

    createFeatureFeedback(
        feedback: Omit<IFeatureFeedback, 'id' | 'createdAt'>,
    ): Promise<IFeatureFeedback> {
        return this.featureFeedbackStore.createFeatureFeedback(feedback);
    }

    getFeedbackForFeature(featureName: string): Promise<IFeatureFeedback[]> {
        return this.featureFeedbackStore.getFeedbackForFeature(featureName);
    }
}

module.exports = FeedbackService;
export default FeedbackService;
