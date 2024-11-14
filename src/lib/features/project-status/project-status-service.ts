import type { ProjectStatusSchema } from '../../openapi';
import type {
    IApiTokenStore,
    IEventStore,
    IFeatureToggleStore,
    IProjectStore,
    ISegmentStore,
    IUnleashStores,
} from '../../types';
import type { IPersonalDashboardReadModel } from '../personal-dashboard/personal-dashboard-read-model-type';
import type { IProjectLifecycleSummaryReadModel } from './project-lifecycle-read-model/project-lifecycle-read-model-type';

export class ProjectStatusService {
    private eventStore: IEventStore;
    private projectStore: IProjectStore;
    private apiTokenStore: IApiTokenStore;
    private segmentStore: ISegmentStore;
    private personalDashboardReadModel: IPersonalDashboardReadModel;
    private projectLifecycleSummaryReadModel: IProjectLifecycleSummaryReadModel;
    private featureToggleStore: IFeatureToggleStore;

    constructor(
        {
            eventStore,
            projectStore,
            apiTokenStore,
            segmentStore,
            featureToggleStore,
        }: Pick<
            IUnleashStores,
            | 'eventStore'
            | 'projectStore'
            | 'apiTokenStore'
            | 'segmentStore'
            | 'featureToggleStore'
        >,
        personalDashboardReadModel: IPersonalDashboardReadModel,
        projectLifecycleReadModel: IProjectLifecycleSummaryReadModel,
    ) {
        this.eventStore = eventStore;
        this.projectStore = projectStore;
        this.apiTokenStore = apiTokenStore;
        this.segmentStore = segmentStore;
        this.personalDashboardReadModel = personalDashboardReadModel;
        this.projectLifecycleSummaryReadModel = projectLifecycleReadModel;
        this.featureToggleStore = featureToggleStore;
    }

    async getProjectStatus(projectId: string): Promise<ProjectStatusSchema> {
        const [
            connectedEnvironments,
            members,
            apiTokens,
            segments,
            activityCountByDate,
            healthScores,
            lifecycleSummary,
            staleFlagCount,
        ] = await Promise.all([
            this.projectStore.getConnectedEnvironmentCountForProject(projectId),
            this.projectStore.getMembersCountByProject(projectId),
            this.apiTokenStore.countProjectTokens(projectId),
            this.segmentStore.getProjectSegmentCount(projectId),
            this.eventStore.getProjectRecentEventActivity(projectId),
            this.personalDashboardReadModel.getLatestHealthScores(projectId, 4),
            this.projectLifecycleSummaryReadModel.getProjectLifecycleSummary(
                projectId,
            ),
            this.featureToggleStore.getStaleFlagCountForProject(projectId),
        ]);

        const averageHealth = healthScores.length
            ? healthScores.reduce((acc, num) => acc + num, 0) /
              healthScores.length
            : 0;

        return {
            resources: {
                connectedEnvironments,
                members,
                apiTokens,
                segments,
            },
            activityCountByDate,
            averageHealth: Math.round(averageHealth),
            lifecycleSummary,
            staleFlags: {
                total: staleFlagCount,
            },
        };
    }
}
