import { InvalidOperationError, PermissionError } from '../../error/index.js';
import type { CreateDependentFeatureSchema } from '../../openapi/index.js';
import type { IDependentFeaturesStore } from './dependent-features-store-type.js';
import type {
    FeatureDependency,
    FeatureDependencyId,
} from './dependent-features.js';
import type { IDependentFeaturesReadModel } from './dependent-features-read-model-type.js';
import type { EventService } from '../../services/index.js';
import type { IAuditUser, IUser } from '../../types/index.js';
import {
    FeatureDependenciesRemovedEvent,
    FeatureDependencyAddedEvent,
    FeatureDependencyRemovedEvent,
    SKIP_CHANGE_REQUEST,
} from '../../types/index.js';
import type { IChangeRequestAccessReadModel } from '../change-request-access-service/change-request-access-read-model.js';
import type { IFeaturesReadModel } from '../feature-toggle/types/features-read-model-type.js';

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
        auditUser: IAuditUser,
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
                    auditUser,
                ),
            ),
        );
    }

    async upsertFeatureDependency(
        { child, projectId }: { child: string; projectId: string },
        dependentFeature: CreateDependentFeatureSchema,
        user: IUser,
        auditUser: IAuditUser,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, user);

        return this.unprotectedUpsertFeatureDependency(
            { child, projectId },
            dependentFeature,
            auditUser,
        );
    }

    async unprotectedUpsertFeatureDependency(
        { child, projectId }: { child: string; projectId: string },
        dependentFeature: CreateDependentFeatureSchema,
        auditUser: IAuditUser,
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
        await this.eventService.storeEvent(
            new FeatureDependencyAddedEvent({
                project: projectId,
                featureName: child,
                auditUser,
                data: {
                    feature: parent,
                    enabled: featureDependency.enabled,
                    ...(variants !== undefined && { variants }),
                },
            }),
        );
    }

    async deleteFeatureDependency(
        dependency: FeatureDependencyId,
        projectId: string,
        user: IUser,
        auditUser: IAuditUser,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, user);

        return this.unprotectedDeleteFeatureDependency(
            dependency,
            projectId,
            auditUser,
        );
    }

    async unprotectedDeleteFeatureDependency(
        dependency: FeatureDependencyId,
        projectId: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        await this.dependentFeaturesStore.delete(dependency);
        await this.eventService.storeEvent(
            new FeatureDependencyRemovedEvent({
                project: projectId,
                featureName: dependency.child,
                auditUser,
                data: { feature: dependency.parent },
            }),
        );
    }

    async deleteFeaturesDependencies(
        features: string[],
        projectId: string,
        user: IUser,
        auditUser: IAuditUser,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, user);

        return this.unprotectedDeleteFeaturesDependencies(
            features,
            projectId,
            auditUser,
        );
    }

    async unprotectedDeleteFeaturesDependencies(
        features: string[],
        projectId: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        const dependencies =
            await this.dependentFeaturesReadModel.getDependencies(features);
        const featuresWithDependencies = dependencies.map(
            (dependency) => dependency.feature,
        );
        if (featuresWithDependencies.length > 0) {
            await this.dependentFeaturesStore.deleteAll(
                featuresWithDependencies,
            );
            await this.eventService.storeEvents(
                featuresWithDependencies.map(
                    (feature) =>
                        new FeatureDependenciesRemovedEvent({
                            project: projectId,
                            featureName: feature,
                            auditUser,
                        }),
                ),
            );
        }
    }

    async getPossibleParentFeatures(feature: string): Promise<string[]> {
        return this.dependentFeaturesReadModel.getPossibleParentFeatures(
            feature,
        );
    }

    async getPossibleParentVariants(parentFeature: string): Promise<string[]> {
        return this.dependentFeaturesReadModel.getPossibleParentVariants(
            parentFeature,
        );
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
