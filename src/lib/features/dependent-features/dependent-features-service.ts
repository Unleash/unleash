import { InvalidOperationError } from '../../error';
import { CreateDependentFeatureSchema } from '../../openapi';
import { IDependentFeaturesStore } from './dependent-features-store-type';
import { FeatureDependency, FeatureDependencyId } from './dependent-features';

export class DependentFeaturesService {
    private dependentFeaturesStore: IDependentFeaturesStore;

    constructor(dependentFeaturesStore: IDependentFeaturesStore) {
        this.dependentFeaturesStore = dependentFeaturesStore;
    }

    async upsertFeatureDependency(
        child: string,
        dependentFeature: CreateDependentFeatureSchema,
    ): Promise<void> {
        const { enabled, feature: parent, variants } = dependentFeature;

        const children = await this.dependentFeaturesStore.getChildren(child);
        if (children.length > 0) {
            throw new InvalidOperationError(
                'Transitive dependency detected. Cannot add a dependency to the feature that other features depend on.',
            );
        }

        const featureDependency: FeatureDependency =
            enabled === false
                ? {
                      parent,
                      child,
                      enabled,
                  }
                : {
                      parent,
                      child,
                      enabled: true,
                      variants,
                  };
        await this.dependentFeaturesStore.upsert(featureDependency);
    }

    async deleteFeatureDependency(
        dependency: FeatureDependencyId,
    ): Promise<void> {
        await this.dependentFeaturesStore.delete(dependency);
    }
}
