export interface IProjectPermissionStore {
    getUserAccessibleProjects(userId: number): Promise<string[]>;
}
