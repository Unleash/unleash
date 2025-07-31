import type { IFeaturesReadModel } from '../types/features-read-model-type.js';

export class FakeFeaturesReadModel implements IFeaturesReadModel {
    featureExists(): Promise<boolean> {
        return Promise.resolve(false);
    }

    featuresInTheSameProject(
        featureA: string,
        featureB: string,
        project: string,
    ): Promise<boolean> {
        return Promise.resolve(true);
    }
}
