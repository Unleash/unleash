import type {
    IFeatureLastSeenResults,
    ILastSeenReadModel,
} from './types/last-seen-read-model-type.js';

export class FakeLastSeenReadModel implements ILastSeenReadModel {
    getForFeature(features: string[]): Promise<IFeatureLastSeenResults> {
        return Promise.resolve({});
    }
}
