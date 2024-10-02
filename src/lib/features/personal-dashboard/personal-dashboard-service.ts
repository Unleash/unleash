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
    IAccessStore,
    IAccountStore,
    IEvent,
    IEventStore,
    IOnboardingReadModel,
    MinimalUser,
} from '../../types';
import type { FeatureEventFormatter } from '../../addons/feature-event-formatter-md';
import { generateImageUrl } from '../../util';
import type { PersonalDashboardProjectDetailsSchema } from '../../openapi';
import type { IRoleWithProject } from '../../types/stores/access-store';

export class PersonalDashboardService {
    private personalDashboardReadModel: IPersonalDashboardReadModel;

    private projectOwnersReadModel: IProjectOwnersReadModel;

    private projectReadModel: IProjectReadModel;

    private privateProjectChecker: IPrivateProjectChecker;

    private eventStore: IEventStore;

    private featureEventFormatter: FeatureEventFormatter;

    private accountStore: IAccountStore;

    private onboardingReadModel: IOnboardingReadModel;

    private accessStore: IAccessStore;

    constructor(
        personalDashboardReadModel: IPersonalDashboardReadModel,
        projectOwnersReadModel: IProjectOwnersReadModel,
        projectReadModel: IProjectReadModel,
        onboardingReadModel: IOnboardingReadModel,
        eventStore: IEventStore,
        featureEventFormatter: FeatureEventFormatter,
        privateProjectChecker: IPrivateProjectChecker,
        accountStore: IAccountStore,
        accessStore: IAccessStore,
    ) {
        this.personalDashboardReadModel = personalDashboardReadModel;
        this.projectOwnersReadModel = projectOwnersReadModel;
        this.projectReadModel = projectReadModel;
        this.onboardingReadModel = onboardingReadModel;
        this.eventStore = eventStore;
        this.featureEventFormatter = featureEventFormatter;
        this.privateProjectChecker = privateProjectChecker;
        this.accountStore = accountStore;
        this.accessStore = accessStore;
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
        userId: number,
        projectId: string,
    ): Promise<PersonalDashboardProjectDetailsSchema> {
        const formatEvents = (recentEvents: IEvent[]) =>
            recentEvents.map((event) => ({
                summary: this.featureEventFormatter.format(event).text,
                createdBy: event.createdBy,
                id: event.id,
                createdByImageUrl: generateImageUrl({ email: event.createdBy }),
            }));

        const filterRoles = (allRoles: IRoleWithProject[]) =>
            allRoles
                .filter((role) => ['project', 'custom'].includes(role.type))
                .map((role) => ({
                    id: role.id,
                    name: role.name,
                    type: role.type as PersonalDashboardProjectDetailsSchema['roles'][number]['type'],
                }));

        const [latestEvents, onboardingStatus, owners, roles, healthScores] =
            await Promise.all([
                this.eventStore
                    .searchEvents({ limit: 4, offset: 0 }, [
                        {
                            field: 'project',
                            operator: 'IS',
                            values: [projectId],
                        },
                    ])
                    .then(formatEvents),
                this.onboardingReadModel.getOnboardingStatusForProject(
                    projectId,
                ),
                this.projectOwnersReadModel.getProjectOwners(projectId),
                this.accessStore
                    .getAllProjectRolesForUser(userId, projectId)
                    .then(filterRoles),
                this.personalDashboardReadModel.getLatestHealthScores(
                    projectId,
                    8,
                ),
            ]);

        let avgHealthCurrentWindow: number | null = null;
        let avgHealthPastWindow: number | null = null;

        if (healthScores.length >= 4) {
            avgHealthCurrentWindow = Math.round(
                healthScores
                    .slice(0, 4)
                    .reduce((acc, score) => acc + score, 0) / 4,
            );
        }

        if (healthScores.length >= 8) {
            avgHealthPastWindow = Math.round(
                healthScores
                    .slice(4, 8)
                    .reduce((acc, score) => acc + score, 0) / 4,
            );
        }

        return {
            latestEvents,
            onboardingStatus,
            owners,
            roles,
            insights: {
                avgHealthCurrentWindow,
                avgHealthPastWindow,
            },
        };
    }

    async getAdmins(): Promise<MinimalUser[]> {
        return this.accountStore.getAdmins();
    }
}
