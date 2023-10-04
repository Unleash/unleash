import { ILastSeenReadModel } from './types/last-seen-read-model-type';

export class FakeLastSeenReadModel implements ILastSeenReadModel {
    getForFeature(
        features: string[],
    ): Promise<{ lastSeen: Date; environment: string }[]> {
        features.map((feature) => feature);
        return Promise.resolve([]);
    }
}
