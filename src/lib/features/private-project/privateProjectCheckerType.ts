import { ProjectAccess } from './privateProjectStore';

export interface IPrivateProjectChecker {
    getUserAccessibleProjects(userId: number): Promise<ProjectAccess>;
    hasAccessToProject(userId: number, projectId: string): Promise<boolean>;
}
