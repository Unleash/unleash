import type { ProjectAccess } from './privateProjectStore';

export interface IPrivateProjectChecker {
    getUserAccessibleProjects(userId: number): Promise<ProjectAccess>;
    filterUserAccessibleProjects(
        userId: number,
        projects: string[],
    ): Promise<string[]>;
    hasAccessToProject(userId: number, projectId: string): Promise<boolean>;
}
