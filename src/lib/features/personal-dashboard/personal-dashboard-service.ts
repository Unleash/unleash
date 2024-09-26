import type { IProjectOwnersReadModel } from '../project/project-owners-read-model.type';
import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProjectWithOwners,
} from './personal-dashboard-read-model-type';

export class PersonalDashboardService {
    private personalDashboardReadModel: IPersonalDashboardReadModel;

    private projectOwnersReadModel: IProjectOwnersReadModel;

    constructor(
        personalDashboardReadModel: IPersonalDashboardReadModel,
        projectOwnersReadModel: IProjectOwnersReadModel,
    ) {
        this.personalDashboardReadModel = personalDashboardReadModel;
        this.projectOwnersReadModel = projectOwnersReadModel;
    }

    getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        return this.personalDashboardReadModel.getPersonalFeatures(userId);
    }

    async getPersonalProjects(
        userId: number,
    ): Promise<PersonalProjectWithOwners[]> {
        const projects =
            await this.personalDashboardReadModel.getPersonalProjects(userId);

        const withOwners =
            await this.projectOwnersReadModel.addOwners(projects);

        return withOwners;
    }
}
