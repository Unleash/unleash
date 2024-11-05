import type { ProjectStatusSchema } from '../../openapi';
import type { IEventStore, IProjectStore, IUnleashStores } from '../../types';

export class ProjectStatusService {
    private eventStore: IEventStore;
    private projectStore: IProjectStore;

    constructor({
        eventStore,
        projectStore,
    }: Pick<IUnleashStores, 'eventStore' | 'projectStore'>) {
        this.eventStore = eventStore;
        this.projectStore = projectStore;
    }

    async getProjectStatus(projectId: string): Promise<ProjectStatusSchema> {
        return {
            resources: {
                connectedEnvironments:
                    await this.projectStore.getConnectedEnvironmentCountForProject(
                        projectId,
                    ),
            },
            activityCountByDate:
                await this.eventStore.getProjectEventActivity(projectId),
        };
    }
}
