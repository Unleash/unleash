import { InvalidOperationError, PermissionError } from '../../error';
import { CreateDependentFeatureSchema } from '../../openapi';
import { IDependentFeaturesStore } from './dependent-features-store-type';
import { FeatureDependency, FeatureDependencyId } from './dependent-features';
import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import { EventService } from '../../services';
import { User } from '../../server-impl';
import { SKIP_CHANGE_REQUEST } from '../../types';
import { IChangeRequestAccessReadModel } from '../change-request-access-service/change-request-access-read-model';
import { extractUsernameFromUser } from '../../util';

export class DependentFeaturesService {
    private dependentFeaturesStore: IDependentFeaturesStore;

    private dependentFeaturesReadModel: IDependentFeaturesReadModel;

    private changeRequestAccessReadModel: IChangeRequestAccessReadModel;

    private eventService: EventService;

    constructor(
        dependentFeaturesStore: IDependentFeaturesStore,
        dependentFeaturesReadModel: IDependentFeaturesReadModel,
        changeRequestAccessReadModel: IChangeRequestAccessReadModel,
        eventService: EventService,
    ) {
        this.dependentFeaturesStore = dependentFeaturesStore;
        this.dependentFeaturesReadModel = dependentFeaturesReadModel;
        this.changeRequestAccessReadModel = changeRequestAccessReadModel;
        this.eventService = eventService;
    }

    async cloneDependencies(
        {
            featureName,
            newFeatureName,
            projectId,
        }: { featureName: string; newFeatureName: string; projectId: string },
        user: string,
    ) {
        const parents = await this.dependentFeaturesReadModel.getParents(
            featureName,
        );
        await Promise.all(
            parents.map((parent) =>
                this.unprotectedUpsertFeatureDependency(
                    { child: newFeatureName, projectId },
                    {
                        feature: parent.feature,
                        enabled: parent.enabled,
                        variants: parent.variants,
                    },
                    user,
                ),
            ),
        );
    }

    async upsertFeatureDependency(
        { child, projectId }: { child: string; projectId: string },
        dependentFeature: CreateDependentFeatureSchema,
        user: User,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, user);

        return this.unprotectedUpsertFeatureDependency(
            { child, projectId },
            dependentFeature,
            extractUsernameFromUser(user),
        );
    }

    async unprotectedUpsertFeatureDependency(
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
        user: User,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, user);

        return this.unprotectedDeleteFeatureDependency(
            dependency,
            projectId,
            extractUsernameFromUser(user),
        );
    }

    async unprotectedDeleteFeatureDependency(
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
        user: User,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, user);

        return this.unprotectedDeleteFeatureDependencies(
            feature,
            projectId,
            extractUsernameFromUser(user),
        );
    }

    async unprotectedDeleteFeatureDependencies(
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

    private async stopWhenChangeRequestsEnabled(project: string, user?: User) {
        const canBypass =
            await this.changeRequestAccessReadModel.canBypassChangeRequestForProject(
                project,
                user,
            );
        if (!canBypass) {
            throw new PermissionError(SKIP_CHANGE_REQUEST);
        }
    }
}
