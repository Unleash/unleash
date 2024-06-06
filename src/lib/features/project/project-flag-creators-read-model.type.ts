export interface IProjectFlagCreatorsReadModel {
    getFlagCreators(
        project: string,
    ): Promise<Array<{ id: number; name: string }>>;
}
