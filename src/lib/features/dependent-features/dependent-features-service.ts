import { CreateDependentFeatureSchema } from '../../openapi';

export type FeatureDependency =
    | {
          parent: string;
          child: string;
          enabled: true;
          variants?: string[];
      }
    | { parent: string; child: string; enabled: false };
export class DependentFeaturesService {
    async upsertFeatureDependency(
        parentFeature: string,
        dependentFeature: CreateDependentFeatureSchema,
    ): Promise<void> {
        const { enabled, feature, variants } = dependentFeature;
        const featureDependency: FeatureDependency =
            enabled === false
                ? {
                      parent: parentFeature,
                      child: feature,
                      enabled,
                  }
                : {
                      parent: parentFeature,
                      child: feature,
                      enabled: true,
                      variants,
                  };
        console.log(featureDependency);
    }
}
