export interface IAccessReadModel {
    isRootAdmin(userId: number): Promise<boolean>;
}
