import type { IProjectOwnersReadModel } from '../project/project-owners-read-model.type';
import type { IProjectReadModel } from '../project/project-read-model-type';
import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProjectWithOwners,
} from './personal-dashboard-read-model-type';

export class PersonalDashboardService {
    private personalDashboardReadModel: IPersonalDashboardReadModel;

    private projectOwnersReadModel: IProjectOwnersReadModel;

    private projectReadModel: IProjectReadModel;

    constructor(
        personalDashboardReadModel: IPersonalDashboardReadModel,
        projectOwnersReadModel: IProjectOwnersReadModel,
        projectReadModel: IProjectReadModel,
    ) {
        this.personalDashboardReadModel = personalDashboardReadModel;
        this.projectOwnersReadModel = projectOwnersReadModel;
        this.projectReadModel = projectReadModel;
    }

    getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        return this.personalDashboardReadModel.getPersonalFeatures(userId);
    }

    async getPersonalProjects(
        userId: number,
    ): Promise<PersonalProjectWithOwners[]> {
        const projectIds =
            await this.projectReadModel.getProjectsByUser(userId);

        console.log('got these', projectIds.length, 'projects', projectIds);
        const enriched = await this.personalDashboardReadModel.enrichProjectIds(
            userId,
            projectIds,
        );
        // console.log('got these', enriched.length, 'projects', projectIds);
        const projects =
            await this.personalDashboardReadModel.getPersonalProjects(userId);

        const withOwners =
            await this.projectOwnersReadModel.addOwners(projects);

        return withOwners;
    }
}
