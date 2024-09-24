export type PersonalFeature = { name: string; type: string; project: string };

export interface IPersonalDashboardReadModel {
    getPersonalFeatures(userId: number): Promise<PersonalFeature[]>;
}
