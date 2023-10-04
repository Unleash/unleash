import { InvalidOperationError } from '../../error';
import { CreateDependentFeatureSchema } from '../../openapi';
import { IDependentFeaturesStore } from './dependent-features-store-type';
import { FeatureDependency, FeatureDependencyId } from './dependent-features';
import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import { EventService } from '../../services';

export class DependentFeaturesService {
    private dependentFeaturesStore: IDependentFeaturesStore;

    private dependentFeaturesReadModel: IDependentFeaturesReadModel;

    private eventService: EventService;

    constructor(
        dependentFeaturesStore: IDependentFeaturesStore,
        dependentFeaturesReadModel: IDependentFeaturesReadModel,
        eventService: EventService,
    ) {
        this.dependentFeaturesStore = dependentFeaturesStore;
        this.dependentFeaturesReadModel = dependentFeaturesReadModel;
        this.eventService = eventService;
    }

    async upsertFeatureDependency(
        { child, projectId }: { child: string; projectId: string },
        dependentFeature: CreateDependentFeatureSchema,
        user: string,
    ): Promise<void> {
        const { enabled, feature: parent, variants } = dependentFeature;

        const children = await this.dependentFeaturesReadModel.getChildren([
            child,
        ]);
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
        await this.eventService.storeEvent({
            type: 'feature-dependency-added',
            project: projectId,
            featureName: child,
            createdBy: user,
            data: {
                feature: parent,
                enabled: featureDependency.enabled,
                ...(variants !== undefined && { variants }),
            },
        });
    }

    async deleteFeatureDependency(
        dependency: FeatureDependencyId,
        projectId: string,
        user: string,
    ): Promise<void> {
        await this.dependentFeaturesStore.delete(dependency);
        await this.eventService.storeEvent({
            type: 'feature-dependency-removed',
            project: projectId,
            featureName: dependency.child,
            createdBy: user,
            data: { feature: dependency.parent },
        });
    }

    async deleteFeatureDependencies(
        feature: string,
        projectId: string,
        user: string,
    ): Promise<void> {
        await this.dependentFeaturesStore.deleteAll(feature);
        await this.eventService.storeEvent({
            type: 'feature-dependencies-removed',
            project: projectId,
            featureName: feature,
            createdBy: user,
        });
    }

    async getParentOptions(feature: string): Promise<string[]> {
        return this.dependentFeaturesReadModel.getParentOptions(feature);
    }
}
