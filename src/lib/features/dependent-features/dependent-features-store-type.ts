import { FeatureDependency, FeatureDependencyId } from './dependent-features';

export interface IDependentFeaturesStore {
    upsert(featureDependency: FeatureDependency): Promise<void>;
    getChildren(parent: string): Promise<string[]>;
    delete(dependency: FeatureDependencyId): Promise<void>;
}
