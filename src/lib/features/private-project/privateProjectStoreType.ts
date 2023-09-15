export interface IPrivateProjectStore {
    getUserAccessibleProjects(userId: number): Promise<string[]>;
}
