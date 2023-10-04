import { IFeatureLastSeenResults } from './last-seen-read-model';
import { ILastSeenReadModel } from './types/last-seen-read-model-type';

export class FakeLastSeenReadModel implements ILastSeenReadModel {
    getForFeature(features: string[]): Promise<IFeatureLastSeenResults> {
        features.map((feature) => feature);
        return Promise.resolve({});
    }
}
