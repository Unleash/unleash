export interface IProjectStaleFlagsReadModel {
    getStaleFlagCountForProject: (projectId: string) => Promise<number>;
}
