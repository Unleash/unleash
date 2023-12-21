import { InvalidOperationError, PermissionError } from '../../error';
import { CreateDependentFeatureSchema } from '../../openapi';
import { IDependentFeaturesStore } from './dependent-features-store-type';
import { FeatureDependency, FeatureDependencyId } from './dependent-features';
import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import { EventService } from '../../services';
import { IUser } from '../../server-impl';
import { SKIP_CHANGE_REQUEST } from '../../types';
import { IChangeRequestAccessReadModel } from '../change-request-access-service/change-request-access-read-model';
import { extractUsernameFromUser } from '../../util';
import { IFeaturesReadModel } from '../feature-toggle/types/features-read-model-type';

interface IDependentFeaturesServiceDeps {
    dependentFeaturesStore: IDependentFeaturesStore;
    dependentFeaturesReadModel: IDependentFeaturesReadModel;
    changeRequestAccessReadModel: IChangeRequestAccessReadModel;
    featuresReadModel: IFeaturesReadModel;
    eventService: EventService;
}

export class DependentFeaturesService {
    private dependentFeaturesStore: IDependentFeaturesStore;

    private dependentFeaturesReadModel: IDependentFeaturesReadModel;

    private changeRequestAccessReadModel: IChangeRequestAccessReadModel;

    private featuresReadModel: IFeaturesReadModel;

    private eventService: EventService;

    constructor({
        featuresReadModel,
        dependentFeaturesReadModel,
        dependentFeaturesStore,
        eventService,
        changeRequestAccessReadModel,
    }: IDependentFeaturesServiceDeps) {
        this.dependentFeaturesStore = dependentFeaturesStore;
        this.dependentFeaturesReadModel = dependentFeaturesReadModel;
        this.changeRequestAccessReadModel = changeRequestAccessReadModel;
        this.featuresReadModel = featuresReadModel;
        this.eventService = eventService;
    }

    async cloneDependencies(
        {
            featureName,
            newFeatureName,
            projectId,
        }: { featureName: string; newFeatureName: string; projectId: string },
        user: string,
        userId: number,
    ) {
        const parents =
            await this.dependentFeaturesReadModel.getParents(featureName);
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
                    userId,
                ),
            ),
        );
    }

    async upsertFeatureDependency(
        { child, projectId }: { child: string; projectId: string },
        dependentFeature: CreateDependentFeatureSchema,
        user: IUser,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, user);

        return this.unprotectedUpsertFeatureDependency(
            { child, projectId },
            dependentFeature,
            extractUsernameFromUser(user),
            user.id,
        );
    }

    async unprotectedUpsertFeatureDependency(
        { child, projectId }: { child: string; projectId: string },
        dependentFeature: CreateDependentFeatureSchema,
        user: string,
        userId: number,
    ): Promise<void> {
        const { enabled, feature: parent, variants } = dependentFeature;

        if (child === parent) {
            throw new InvalidOperationError(
                'A feature flag cannot depend on itself.',
            );
        }

        const [grandchildren, grandparents, parentExists, sameProject] =
            await Promise.all([
                this.dependentFeaturesReadModel.getChildren([child]),
                this.dependentFeaturesReadModel.getParents(parent),
                this.featuresReadModel.featureExists(parent),
                this.featuresReadModel.featuresInTheSameProject(child, parent),
            ]);

        if (grandchildren.length > 0) {
            throw new InvalidOperationError(
                'Transitive dependency detected. Cannot add a dependency to the feature that other features depend on.',
            );
        }

        if (grandparents.length > 0) {
            throw new InvalidOperationError(
                'Transitive dependency detected. Cannot add a dependency to the feature that has parent dependency.',
            );
        }

        if (!parentExists) {
            throw new InvalidOperationError(
                `No active feature ${parent} exists`,
            );
        }

        if (!sameProject) {
            throw new InvalidOperationError(
                'Parent and child features should be in the same project',
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
            createdByUserId: userId,
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
        user: IUser,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, user);

        return this.unprotectedDeleteFeatureDependency(
            dependency,
            projectId,
            extractUsernameFromUser(user),
            user.id,
        );
    }

    async unprotectedDeleteFeatureDependency(
        dependency: FeatureDependencyId,
        projectId: string,
        user: string,
        userId: number,
    ): Promise<void> {
        await this.dependentFeaturesStore.delete(dependency);
        await this.eventService.storeEvent({
            type: 'feature-dependency-removed',
            project: projectId,
            featureName: dependency.child,
            createdBy: user,
            createdByUserId: userId,
            data: { feature: dependency.parent },
        });
    }

    async deleteFeaturesDependencies(
        features: string[],
        projectId: string,
        user: IUser,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, user);

        return this.unprotectedDeleteFeaturesDependencies(
            features,
            projectId,
            extractUsernameFromUser(user),
            user.id,
        );
    }

    async unprotectedDeleteFeaturesDependencies(
        features: string[],
        projectId: string,
        user: string,
        userId: number,
    ): Promise<void> {
        await this.dependentFeaturesStore.deleteAll(features);
        await this.eventService.storeEvents(
            features.map((feature) => ({
                type: 'feature-dependencies-removed',
                project: projectId,
                featureName: feature,
                createdBy: user,
                createdByUserId: userId,
            })),
        );
    }

    async getParentOptions(feature: string): Promise<string[]> {
        return this.dependentFeaturesReadModel.getParentOptions(feature);
    }

    async checkDependenciesExist(): Promise<boolean> {
        return this.dependentFeaturesReadModel.hasAnyDependencies();
    }

    private async stopWhenChangeRequestsEnabled(project: string, user?: IUser) {
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
