import type {
    FeatureDependency,
    FeatureDependencyId,
} from './dependent-features';

export interface IDependentFeaturesStore {
    upsert(featureDependency: FeatureDependency): Promise<void>;
    delete(dependency: FeatureDependencyId): Promise<void>;
    deleteAll(children?: string[]): Promise<void>;
}
