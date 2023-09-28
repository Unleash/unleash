import { InvalidOperationError } from '../../error';
import { CreateDependentFeatureSchema } from '../../openapi';
import { IDependentFeaturesStore } from './dependent-features-store-type';
import { FeatureDependency, FeatureDependencyId } from './dependent-features';
import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';

export class DependentFeaturesService {
    private dependentFeaturesStore: IDependentFeaturesStore;

    private dependentFeaturesReadModel: IDependentFeaturesReadModel;

    constructor(
        dependentFeaturesStore: IDependentFeaturesStore,
        dependentFeaturesReadModel: IDependentFeaturesReadModel,
    ) {
        this.dependentFeaturesStore = dependentFeaturesStore;
        this.dependentFeaturesReadModel = dependentFeaturesReadModel;
    }

    async upsertFeatureDependency(
        child: string,
        dependentFeature: CreateDependentFeatureSchema,
    ): Promise<void> {
        const { enabled, feature: parent, variants } = dependentFeature;

        const children = await this.dependentFeaturesReadModel.getChildren(
            child,
        );
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

    async deleteFeatureDependencies(feature: string): Promise<void> {
        await this.dependentFeaturesStore.deleteAll(feature);
    }

    async getParentOptions(feature: string): Promise<string[]> {
        return this.dependentFeaturesReadModel.getParentOptions(feature);
    }
}
