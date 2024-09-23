import type { IPersonalDashboardReadModel } from './personal-dashboard-read-model-type';

export class PersonalDashboardService {
    private personalDashboardReadModel: IPersonalDashboardReadModel;

    constructor(personalDashboardReadModel: IPersonalDashboardReadModel) {
        this.personalDashboardReadModel = personalDashboardReadModel;
    }

    getPersonalFeatures(userId: number): Promise<{ name: string }[]> {
        return this.personalDashboardReadModel.getPersonalFeatures(userId);
    }
}
