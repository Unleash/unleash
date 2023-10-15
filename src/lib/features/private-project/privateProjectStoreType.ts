import { ProjectAccess } from './privateProjectStore';

export interface IPrivateProjectStore {
    getUserAccessibleProjects(userId: number): Promise<ProjectAccess>;
}
