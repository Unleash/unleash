import type {
    IFeatureLastSeenResults,
    ILastSeenReadModel,
} from './types/last-seen-read-model-type.js';

export class FakeLastSeenReadModel implements ILastSeenReadModel {
    getForFeature(_features: string[]): Promise<IFeatureLastSeenResults> {
        return Promise.resolve({});
    }
}
