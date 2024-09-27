import type {
    IProjectOwnersReadModel,
    UserProjectOwner,
} from '../project/project-owners-read-model.type';
import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProject,
} from './personal-dashboard-read-model-type';
import type { IProjectReadModel } from '../project/project-read-model-type';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';

export class PersonalDashboardService {
    private personalDashboardReadModel: IPersonalDashboardReadModel;

    private projectOwnersReadModel: IProjectOwnersReadModel;

    private projectReadModel: IProjectReadModel;

    private privateProjectChecker: IPrivateProjectChecker;

    constructor(
        personalDashboardReadModel: IPersonalDashboardReadModel,
        projectOwnersReadModel: IProjectOwnersReadModel,
        projectReadModel: IProjectReadModel,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.personalDashboardReadModel = personalDashboardReadModel;
        this.projectOwnersReadModel = projectOwnersReadModel;
        this.projectReadModel = projectReadModel;
        this.privateProjectChecker = privateProjectChecker;
    }

    getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        return this.personalDashboardReadModel.getPersonalFeatures(userId);
    }

    async getPersonalProjects(userId: number): Promise<PersonalProject[]> {
        // TODO: add favorite projects in addition to membership projects
        const userProjectIds =
            await this.projectReadModel.getProjectsByUser(userId);

        const projects = await this.projectReadModel.getProjectsForAdminUi({
            ids: userProjectIds,
        });

        const normalizedProjects = projects.map((project) => ({
            id: project.id,
            name: project.name,
            health: project.health,
            memberCount: project.memberCount,
            featureCount: project.featureCount,
        }));

        return normalizedProjects;
    }

    async getProjectOwners(userId: number): Promise<UserProjectOwner[]> {
        const accessibleProjects =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);

        const filter =
            accessibleProjects.mode === 'all'
                ? undefined
                : new Set(accessibleProjects.projects);

        return this.projectOwnersReadModel.getAllUserProjectOwners(filter);
    }
}
