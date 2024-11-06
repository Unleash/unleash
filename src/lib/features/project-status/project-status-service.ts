import type { ProjectStatusSchema } from '../../openapi';
import type {
    IApiTokenStore,
    IEventStore,
    IProjectStore,
    ISegmentStore,
    IUnleashStores,
} from '../../types';

export class ProjectStatusService {
    private eventStore: IEventStore;
    private projectStore: IProjectStore;
    private apiTokenStore: IApiTokenStore;
    private segmentStore: ISegmentStore;

    constructor({
        eventStore,
        projectStore,
        apiTokenStore,
        segmentStore,
    }: Pick<
        IUnleashStores,
        'eventStore' | 'projectStore' | 'apiTokenStore' | 'segmentStore'
    >) {
        this.eventStore = eventStore;
        this.projectStore = projectStore;
        this.apiTokenStore = apiTokenStore;
        this.segmentStore = segmentStore;
    }

    async getProjectStatus(projectId: string): Promise<ProjectStatusSchema> {
        const [
            connectedEnvironments,
            members,
            apiTokens,
            segments,
            activityCountByDate,
        ] = await Promise.all([
            this.projectStore.getConnectedEnvironmentCountForProject(projectId),
            this.projectStore.getMembersCountByProject(projectId),
            this.apiTokenStore
                .getAll()
                .then(
                    (tokens) =>
                        tokens.filter(
                            (token) =>
                                token.project === projectId ||
                                token.projects.includes(projectId),
                        ).length,
                ),

            this.segmentStore.getProjectSegmentCount(projectId),
            this.eventStore.getProjectEventActivity(projectId),
        ]);

        return {
            resources: {
                connectedEnvironments,
                members,
                apiTokens,
                segments,
            },
            activityCountByDate,
        };
    }
}
