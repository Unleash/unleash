import { IFeaturesReadModel } from '../types/features-read-model-type';

export class FakeFeaturesReadModel implements IFeaturesReadModel {
    featureExists(): Promise<boolean> {
        return Promise.resolve(false);
    }
}
