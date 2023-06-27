import { IFeatureFeedback } from '../model';
import { Store } from './store';

export interface IFeatureFeedbackStore extends Store<IFeatureFeedback, number> {
    createFeatureFeedback(
        feedback: Omit<IFeatureFeedback, 'id' | 'createdAt'>,
    ): Promise<IFeatureFeedback>;
    getFeedbackForFeature(featureName: string): Promise<IFeatureFeedback[]>;
}
