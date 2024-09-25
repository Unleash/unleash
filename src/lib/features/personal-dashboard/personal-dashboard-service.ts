import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProject,
} from './personal-dashboard-read-model-type';

export class PersonalDashboardService {
    private personalDashboardReadModel: IPersonalDashboardReadModel;

    constructor(personalDashboardReadModel: IPersonalDashboardReadModel) {
        this.personalDashboardReadModel = personalDashboardReadModel;
    }

    getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        return this.personalDashboardReadModel.getPersonalFeatures(userId);
    }

    getPersonalProjects(userId: number): Promise<PersonalProject[]> {
        return this.personalDashboardReadModel.getPersonalProjects(userId);
    }
}
