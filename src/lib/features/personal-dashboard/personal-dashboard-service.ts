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
import type {
    IAccountStore,
    IEventStore,
    IOnboardingReadModel,
    MinimalUser,
} from '../../types';
import type { FeatureEventFormatter } from '../../addons/feature-event-formatter-md';
import { generateImageUrl } from '../../util';
import type { PersonalDashboardProjectDetailsSchema } from '../../openapi';

export class PersonalDashboardService {
    private personalDashboardReadModel: IPersonalDashboardReadModel;

    private projectOwnersReadModel: IProjectOwnersReadModel;

    private projectReadModel: IProjectReadModel;

    private privateProjectChecker: IPrivateProjectChecker;

    private eventStore: IEventStore;

    private featureEventFormatter: FeatureEventFormatter;

    private accountStore: IAccountStore;

    private onboardingReadModel: IOnboardingReadModel;

    constructor(
        personalDashboardReadModel: IPersonalDashboardReadModel,
        projectOwnersReadModel: IProjectOwnersReadModel,
        projectReadModel: IProjectReadModel,
        onboardingReadModel: IOnboardingReadModel,
        eventStore: IEventStore,
        featureEventFormatter: FeatureEventFormatter,
        privateProjectChecker: IPrivateProjectChecker,
        accountStore: IAccountStore,
    ) {
        this.personalDashboardReadModel = personalDashboardReadModel;
        this.projectOwnersReadModel = projectOwnersReadModel;
        this.projectReadModel = projectReadModel;
        this.onboardingReadModel = onboardingReadModel;
        this.eventStore = eventStore;
        this.featureEventFormatter = featureEventFormatter;
        this.privateProjectChecker = privateProjectChecker;
        this.accountStore = accountStore;
    }

    getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        return this.personalDashboardReadModel.getPersonalFeatures(userId);
    }

    async getPersonalProjects(userId: number): Promise<PersonalProject[]> {
        const [userProjectIds, userFavoritedProjectIds] = await Promise.all([
            this.projectReadModel.getProjectsByUser(userId),
            this.projectReadModel.getProjectsFavoritedByUser(userId),
        ]);

        const projects = await this.projectReadModel.getProjectsForAdminUi({
            ids: [...new Set([...userProjectIds, ...userFavoritedProjectIds])],
            archived: false,
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

    async getPersonalProjectDetails(
        projectId: string,
    ): Promise<PersonalDashboardProjectDetailsSchema> {
        const recentEvents = await this.eventStore.searchEvents(
            { limit: 4, offset: 0 },
            [{ field: 'project', operator: 'IS', values: [projectId] }],
        );

        const onboardingStatus =
            await this.onboardingReadModel.getOnboardingStatusForProject(
                projectId,
            );

        const formattedEvents = recentEvents.map((event) => ({
            summary: this.featureEventFormatter.format(event).text,
            createdBy: event.createdBy,
            id: event.id,
            createdByImageUrl: generateImageUrl({ email: event.createdBy }),
        }));

        const owners =
            await this.projectOwnersReadModel.getUserProjectOwners(projectId);

        return {
            latestEvents: formattedEvents,
            onboardingStatus,
            owners,
            roles: [],
        };
    }

    async getAdmins(): Promise<MinimalUser[]> {
        return this.accountStore.getAdmins();
    }
}
