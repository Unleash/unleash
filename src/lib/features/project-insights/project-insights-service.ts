import type {
    IFeatureToggleStore,
    IFeatureTypeStore,
    IProjectHealth,
    IProjectStore,
    IUnleashStores,
} from '../../types';
import type FeatureToggleService from '../feature-toggle/feature-toggle-service';
import { calculateAverageTimeToProd } from '../feature-toggle/time-to-production/time-to-production';
import type { IProjectStatsStore } from '../../types/stores/project-stats-store-type';
import type { ProjectDoraMetricsSchema } from '../../openapi';
import { calculateProjectHealth } from '../../domain/project-health/project-health';
import type { IProjectInsightsReadModel } from './project-insights-read-model-type';

export class ProjectInsightsService {
    private projectStore: IProjectStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureTypeStore: IFeatureTypeStore;

    private featureToggleService: FeatureToggleService;

    private projectStatsStore: IProjectStatsStore;

    private projectInsightsReadModel: IProjectInsightsReadModel;

    constructor(
        {
            projectStore,
            featureToggleStore,
            featureTypeStore,
            projectStatsStore,
        }: Pick<
            IUnleashStores,
            | 'projectStore'
            | 'featureToggleStore'
            | 'projectStatsStore'
            | 'featureTypeStore'
        >,
        featureToggleService: FeatureToggleService,
        projectInsightsReadModel: IProjectInsightsReadModel,
    ) {
        this.projectStore = projectStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleService = featureToggleService;
        this.projectStatsStore = projectStatsStore;
        this.projectInsightsReadModel = projectInsightsReadModel;
    }

    private async getDoraMetrics(
        projectId: string,
    ): Promise<ProjectDoraMetricsSchema> {
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
        const [overview, featureTypes] = await Promise.all([
            this.getProjectHealth(projectId, false, undefined),
            this.featureTypeStore.getAll(),
        ]);

        const { activeCount, potentiallyStaleCount, staleCount } =
            calculateProjectHealth(overview.features, featureTypes);

        return {
            activeCount,
            potentiallyStaleCount,
            staleCount,
            rating: overview.health,
        };
    }

    async getProjectInsights(projectId: string) {
        const result = {
            members: {
                active: 20,
                inactive: 3,
                totalPreviousMonth: 15,
            },
        };

        const [stats, featureTypeCounts, health, leadTime, changeRequests] =
            await Promise.all([
                this.projectStatsStore.getProjectStats(projectId),
                this.featureToggleService.getFeatureTypeCounts({
                    projectId,
                    archived: false,
                }),
                this.getHealthInsights(projectId),
                this.getDoraMetrics(projectId),
                this.projectInsightsReadModel.getChangeRequests(projectId),
            ]);

        return {
            ...result,
            stats,
            featureTypeCounts,
            health,
            leadTime,
            changeRequests,
        };
    }

    private async getProjectHealth(
        projectId: string,
        archived: boolean = false,
        userId?: number,
    ): Promise<IProjectHealth> {
        const [project, environments, features, members, projectStats] =
            await Promise.all([
                this.projectStore.get(projectId),
                this.projectStore.getEnvironmentsForProject(projectId),
                this.featureToggleService.getFeatureOverview({
                    projectId,
                    archived,
                    userId,
                }),
                this.projectStore.getMembersCountByProject(projectId),
                this.projectStatsStore.getProjectStats(projectId),
            ]);

        return {
            stats: projectStats,
            name: project.name,
            description: project.description!,
            mode: project.mode,
            featureLimit: project.featureLimit,
            featureNaming: project.featureNaming,
            defaultStickiness: project.defaultStickiness,
            health: project.health || 0,
            updatedAt: project.updatedAt,
            createdAt: project.createdAt,
            environments,
            features: features,
            members,
            version: 1,
        };
    }
}
