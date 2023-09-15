export interface IProjectPermissionChecker {
    getUserAccessibleProjects(userId: number): Promise<string[]>;
}
