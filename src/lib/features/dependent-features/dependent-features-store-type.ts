import { FeatureDependency } from './dependent-features-service';

export interface IDependentFeaturesStore {
    upsert(featureDependency: FeatureDependency): Promise<void>;
    delete(
        dependency: Pick<FeatureDependency, 'parent' | 'child'>,
    ): Promise<void>;
}
