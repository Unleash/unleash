import type { IFeaturesReadModel } from '../types/features-read-model-type.js';

export class FakeFeaturesReadModel implements IFeaturesReadModel {
    featureExists(): Promise<boolean> {
        return Promise.resolve(false);
    }

    featuresInTheSameProject(
        _featureA: string,
        _featureB: string,
    ): Promise<boolean> {
        return Promise.resolve(true);
    }
}
