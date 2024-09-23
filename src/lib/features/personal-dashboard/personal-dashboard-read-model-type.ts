export interface IPersonalDashboardReadModel {
    getPersonalFeatures(userId: number): Promise<{ name: string }[]>;
}
