import { FeatureDependency, FeatureDependencyId } from './dependent-features';

export interface IDependentFeaturesStore {
    upsert(featureDependency: FeatureDependency): Promise<void>;
    delete(dependency: FeatureDependencyId): Promise<void>;
    deleteAll(child: string): Promise<void>;
}
