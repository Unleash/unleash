import { calculateProjectHealthRating } from '../../domain/project-health/project-health.js';
import type { ProjectStatusSchema } from '../../openapi/index.js';
import type {
    IApiTokenStore,
    IEventStore,
    IFeatureToggleStore,
    IFeatureTypeStore,
    IProjectStore,
    ISegmentStore,
    IUnleashStores,
} from '../../types/index.js';
import type { IProjectLifecycleSummaryReadModel } from './project-lifecycle-read-model/project-lifecycle-read-model-type.js';
import type { IProjectStaleFlagsReadModel } from './project-stale-flags-read-model/project-stale-flags-read-model-type.js';

export class ProjectStatusService {
    private eventStore: IEventStore;
    private projectStore: IProjectStore;
    private apiTokenStore: IApiTokenStore;
    private segmentStore: ISegmentStore;
    private projectLifecycleSummaryReadModel: IProjectLifecycleSummaryReadModel;
    private projectStaleFlagsReadModel: IProjectStaleFlagsReadModel;
    private featureTypeStore: IFeatureTypeStore;
    private featureToggleStore: IFeatureToggleStore;

    constructor(
        {
            eventStore,
            projectStore,
            apiTokenStore,
            segmentStore,
            featureTypeStore,
            featureToggleStore,
        }: Pick<
            IUnleashStores,
            | 'eventStore'
            | 'projectStore'
            | 'apiTokenStore'
            | 'segmentStore'
            | 'featureTypeStore'
            | 'featureToggleStore'
        >,
        projectLifecycleReadModel: IProjectLifecycleSummaryReadModel,
        projectStaleFlagsReadModel: IProjectStaleFlagsReadModel,
    ) {
        this.eventStore = eventStore;
        this.projectStore = projectStore;
        this.apiTokenStore = apiTokenStore;
        this.segmentStore = segmentStore;
        this.projectLifecycleSummaryReadModel = projectLifecycleReadModel;
        this.projectStaleFlagsReadModel = projectStaleFlagsReadModel;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleStore = featureToggleStore;
    }

    async getProjectStatus(projectId: string): Promise<ProjectStatusSchema> {
        const [
            members,
            apiTokens,
            segments,
            activityCountByDate,
            currentHealth,
            lifecycleSummary,
            staleFlagCount,
        ] = await Promise.all([
            this.projectStore.getMembersCountByProject(projectId),
            this.apiTokenStore.countProjectTokens(projectId),
            this.segmentStore.getProjectSegmentCount(projectId),
            this.eventStore.getProjectRecentEventActivity(projectId),
            calculateProjectHealthRating(
                this.featureTypeStore,
                this.featureToggleStore,
            )({ id: projectId }),
            this.projectLifecycleSummaryReadModel.getProjectLifecycleSummary(
                projectId,
            ),
            this.projectStaleFlagsReadModel.getStaleFlagCountForProject(
                projectId,
            ),
        ]);

        return {
            resources: {
                members,
                apiTokens,
                segments,
            },
            activityCountByDate,
            health: {
                current: currentHealth,
            },
            technicalDebt: {
                current: 100 - currentHealth,
            },
            lifecycleSummary,
            staleFlags: {
                total: staleFlagCount,
            },
        };
    }
}
