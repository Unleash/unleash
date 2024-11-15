import type { ProjectStatusSchema } from '../../openapi';
import type {
    IApiTokenStore,
    IEventStore,
    IProjectStore,
    ISegmentStore,
    IUnleashStores,
} from '../../types';
import type { IPersonalDashboardReadModel } from '../personal-dashboard/personal-dashboard-read-model-type';
import type { IProjectLifecycleSummaryReadModel } from './project-lifecycle-read-model/project-lifecycle-read-model-type';
import type { IProjectStaleFlagsReadModel } from './project-stale-flags-read-model/project-stale-flags-read-model-type';

export class ProjectStatusService {
    private eventStore: IEventStore;
    private projectStore: IProjectStore;
    private apiTokenStore: IApiTokenStore;
    private segmentStore: ISegmentStore;
    private personalDashboardReadModel: IPersonalDashboardReadModel;
    private projectLifecycleSummaryReadModel: IProjectLifecycleSummaryReadModel;
    private projectStaleFlagsReadModel: IProjectStaleFlagsReadModel;

    constructor(
        {
            eventStore,
            projectStore,
            apiTokenStore,
            segmentStore,
        }: Pick<
            IUnleashStores,
            'eventStore' | 'projectStore' | 'apiTokenStore' | 'segmentStore'
        >,
        personalDashboardReadModel: IPersonalDashboardReadModel,
        projectLifecycleReadModel: IProjectLifecycleSummaryReadModel,
        projectStaleFlagsReadModel: IProjectStaleFlagsReadModel,
    ) {
        this.eventStore = eventStore;
        this.projectStore = projectStore;
        this.apiTokenStore = apiTokenStore;
        this.segmentStore = segmentStore;
        this.personalDashboardReadModel = personalDashboardReadModel;
        this.projectLifecycleSummaryReadModel = projectLifecycleReadModel;
        this.projectStaleFlagsReadModel = projectStaleFlagsReadModel;
    }

    async getProjectStatus(projectId: string): Promise<ProjectStatusSchema> {
        const [
            members,
            apiTokens,
            segments,
            activityCountByDate,
            healthScores,
            lifecycleSummary,
            staleFlagCount,
        ] = await Promise.all([
            this.projectStore.getMembersCountByProject(projectId),
            this.apiTokenStore.countProjectTokens(projectId),
            this.segmentStore.getProjectSegmentCount(projectId),
            this.eventStore.getProjectRecentEventActivity(projectId),
            this.personalDashboardReadModel.getLatestHealthScores(projectId, 4),
            this.projectLifecycleSummaryReadModel.getProjectLifecycleSummary(
                projectId,
            ),
            this.projectStaleFlagsReadModel.getStaleFlagCountForProject(
                projectId,
            ),
        ]);

        const averageHealth = healthScores.length
            ? healthScores.reduce((acc, num) => acc + num, 0) /
              healthScores.length
            : 0;

        return {
            resources: {
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
