import { FeatureDependency } from './dependent-features-service';

export interface IDependentFeaturesStore {
    upsert(featureDependency: FeatureDependency): Promise<void>;
    getChildren(parent: string): Promise<string[]>;
}
