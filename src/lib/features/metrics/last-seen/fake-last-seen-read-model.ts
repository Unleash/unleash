import type { IFeatureLastSeenResults } from './last-seen-read-model';
import type { ILastSeenReadModel } from './types/last-seen-read-model-type';

export class FakeLastSeenReadModel implements ILastSeenReadModel {
    // eslint-disable-next-line
    getForFeature(features: string[]): Promise<IFeatureLastSeenResults> {
        return Promise.resolve({});
    }
}
