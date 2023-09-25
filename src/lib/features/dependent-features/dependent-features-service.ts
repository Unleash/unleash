import { InvalidOperationError } from '../../error';
import { CreateDependentFeatureSchema } from '../../openapi';
import { IDependentFeaturesStore } from './dependent-features-store-type';

export type FeatureDependencyId = { parent: string; child: string };
export type FeatureDependency =
    | {
          parent: string;
          child: string;
          enabled: true;
          variants?: string[];
      }
    | { parent: string; child: string; enabled: false };
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
