import type { ProjectStatusSchema } from '../../openapi';
import type { IEventStore, IUnleashStores } from '../../types';

export class ProjectStatusService {
    private eventStore: IEventStore;
    constructor({ eventStore }: Pick<IUnleashStores, 'eventStore'>) {
        this.eventStore = eventStore;
    }

    async getProjectStatus(projectId: string): Promise<ProjectStatusSchema> {
        return {
            resources: {
                connectedEnvironments: 0,
            },
            activityCountByDate:
                await this.eventStore.getProjectEventActivity(projectId),
        };
    }
}
