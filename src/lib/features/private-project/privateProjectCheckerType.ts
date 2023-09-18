export interface IPrivateProjectChecker {
    getUserAccessibleProjects(userId: number): Promise<string[]>;
    hasAccessToProject(userId: number, projectId: string): Promise<boolean>;
}
