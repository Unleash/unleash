import { IStatusUpdate } from 'lib/services/project-service';

export interface IProjectStatusStore {
    updateStatus(projectId: string, status: IStatusUpdate): Promise<void>;
}
