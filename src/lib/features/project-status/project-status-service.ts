import type { ProjectStatusSchema } from '../../openapi';

export class ProjectStatusService {
    constructor() {}

    async getProjectStatus(projectId: string): Promise<ProjectStatusSchema> {
        return { activityCountByDate: [{ date: '2024-09-11', count: 0 }] };
    }
}
