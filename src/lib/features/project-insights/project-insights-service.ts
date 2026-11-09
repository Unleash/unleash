import type {
    IFeatureOverview,
    IFeatureStrategiesStore,
    IFeatureToggleStore,
    IProjectStore,
    IUnleashStores,
} from '../../types/index.js';
import { calculateAverageTimeToProd } from '../feature-toggle/time-to-production/time-to-production.js';
import type { IProjectStatsStore } from '../../types/stores/project-stats-store-type.js';
import type {
    ProjectDoraMetricsSchema,
    ProjectInsightsSchema,
} from '../../openapi/index.js';
import { subDays } from 'date-fns';
import type { IProjectHealthFeaturesReadModel } from '../../domain/project-health/features-read-model.js';

export class ProjectInsightsService {
    private projectStore: IProjectStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private projectStatsStore: IProjectStatsStore;

    private featuresReadModel: IProjectHealthFeaturesReadModel;

    constructor(
        {
            projectStore,
            featureToggleStore,
            projectStatsStore,
            featureStrategiesStore,
        }: Pick<
            IUnleashStores,
            | 'projectStore'
            | 'featureToggleStore'
            | 'projectStatsStore'
            | 'featureStrategiesStore'
        >,
        featuresReadModel: IProjectHealthFeaturesReadModel,
    ) {
        this.projectStore = projectStore;
        this.featureToggleStore = featureToggleStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.projectStatsStore = projectStatsStore;
        this.featuresReadModel = featuresReadModel;
    }

    async getDoraMetrics(projectId: string): Promise<ProjectDoraMetricsSchema> {
        const activeFeatureToggles = (
            await this.featureToggleStore.getAll({ project: projectId })
        ).map((feature) => feature.name);

        const archivedFeatureToggles = (
            await this.featureToggleStore.getAll({
                project: projectId,
                archived: true,
            })
        ).map((feature) => feature.name);

        const featureToggleNames = [
            ...activeFeatureToggles,
            ...archivedFeatureToggles,
        ];

        const projectAverage = calculateAverageTimeToProd(
            await this.projectStatsStore.getTimeToProdDates(projectId),
        );

        const toggleAverage =
            await this.projectStatsStore.getTimeToProdDatesForFeatureToggles(
                projectId,
                featureToggleNames,
            );

        return {
            features: toggleAverage,
            projectAverage: projectAverage,
        };
    }

    private async getHealthInsights(projectId: string) {
        const overview = await this.getProjectHealth(
            projectId,
            false,
            undefined,
        );

        const potentiallyStaleCount =
            await this.featuresReadModel.getPotentiallyStaleCount(projectId);

        return {
            potentiallyStaleCount,
            activeCount: overview.features.filter((flag) => !flag.stale).length,
            staleCount: overview.features.filter((flag) => flag.stale).length,
            technicalDebt: overview.technicalDebt,
            /**
             * @deprecated
             */
            rating: overview.health,
        };
    }

    private async getProjectHealth(
        projectId: string,
        archived: boolean = false,
        userId?: number,
    ): Promise<{
        technicalDebt: number;
        features: IFeatureOverview[];
        /**
         * @deprecated
         */
        health: number;
    }> {
        const [project, features] = await Promise.all([
            this.projectStore.get(projectId),
            this.featureStrategiesStore.getFeatureOverview({
                projectId,
                archived,
                userId,
            }),
        ]);

        return {
            health: project?.health || 0,
            technicalDebt: 100 - (project?.health || 0),
            features: features,
        };
    }

    private async getProjectMembers(
        projectId: string,
    ): Promise<ProjectInsightsSchema['members']> {
        const dateMinusThirtyDays = subDays(new Date(), 30).toISOString();
        const [currentMembers, change] = await Promise.all([
            this.projectStore.getMembersCountByProject(projectId),
            this.projectStore.getMembersCountByProjectAfterDate(
                projectId,
                dateMinusThirtyDays,
            ),
        ]);

        return {
            currentMembers,
            change,
        };
    }

    async getProjectInsights(projectId: string) {
        const [stats, featureTypeCounts, health, leadTime, members] =
            await Promise.all([
                this.projectStatsStore.getProjectStats(projectId),
                this.featureToggleStore.getFeatureTypeCounts({
                    projectId,
                    archived: false,
                }),
                this.getHealthInsights(projectId),
                this.getDoraMetrics(projectId),
                this.getProjectMembers(projectId),
            ]);

        return {
            stats,
            featureTypeCounts,
            technicalDebt: {
                rating: health.technicalDebt,
                activeCount: health.activeCount,
                potentiallyStaleCount: health.potentiallyStaleCount,
                staleCount: health.staleCount,
            },
            leadTime,
            members,
            /**
             * @deprecated
             */
            health: {
                rating: health.rating,
                activeCount: health.activeCount,
                potentiallyStaleCount: health.potentiallyStaleCount,
                staleCount: health.staleCount,
            },
        };
    }
}
