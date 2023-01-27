import { IProjectStats } from 'lib/services/project-service';

export interface IProjectStatsStore {
    updateProjectStats(projectId: string, status: IProjectStats): Promise<void>;
}
