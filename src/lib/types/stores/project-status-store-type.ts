import { IProjectStats } from 'lib/services/project-service';

export interface IProjectStatusStore {
    updateStatus(projectId: string, status: IProjectStats): Promise<void>;
}
