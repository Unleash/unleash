import type { ProjectAccess } from './privateProjectStore.js';

export interface IPrivateProjectStore {
    getUserAccessibleProjects(userId: number): Promise<ProjectAccess>;
}
