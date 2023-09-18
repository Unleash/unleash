export interface IPrivateProjectChecker {
    getUserAccessibleProjects(userId: number): Promise<string[]>;
}
