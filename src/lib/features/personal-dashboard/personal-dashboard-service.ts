import type {
    IProjectOwnersReadModel,
    UserProjectOwner,
} from '../project/project-owners-read-model.type.js';
import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProject,
} from './personal-dashboard-read-model-type.js';
import type { IProjectReadModel } from '../project/project-read-model-type.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import type {
    IAccessStore,
    IAccountStore,
    IEventStore,
    IOnboardingReadModel,
    MinimalUser,
} from '../../types/index.js';
import type { FeatureEventFormatter } from '../../addons/feature-event-formatter-md.js';
import { generateImageUrl } from '../../util/index.js';
import type { PersonalDashboardProjectDetailsSchema } from '../../openapi/index.js';
import type { IRoleWithProject } from '../../types/stores/access-store.js';
import { NotFoundError } from '../../error/index.js';
import type { IEvent } from '../../events/index.js';

type PersonalDashboardProjectDetailsUnserialized = Omit<
    PersonalDashboardProjectDetailsSchema,
    'latestEvents'
> & {
    latestEvents: {
        createdBy: string;
        summary: string;
        createdByImageUrl: string;
        id: number;
        createdAt: Date;
    }[];
};

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
            technicalDebt: 100 - (project.health || 0),
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
    ): Promise<PersonalDashboardProjectDetailsUnserialized> {
        const onboardingStatus =
            await this.onboardingReadModel.getOnboardingStatusForProject(
                projectId,
            );

        if (!onboardingStatus) {
            throw new NotFoundError(
                `No project with id "${projectId}" exists.`,
            );
        }

        const formatEvents = (recentEvents: IEvent[]) =>
            recentEvents.map((event) => ({
                createdAt: event.createdAt,
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

        const [latestEvents, owners, roles, healthScores] = await Promise.all([
            this.eventStore
                .searchEvents({ limit: 10, offset: 0 }, [
                    {
                        field: 'project',
                        operator: 'IS',
                        values: [projectId],
                    },
                ])
                .then(formatEvents),
            this.projectOwnersReadModel.getProjectOwners(projectId),
            this.accessStore
                .getAllProjectRolesForUser(userId, projectId)
                .then(filterRoles),
            this.personalDashboardReadModel.getLatestHealthScores(projectId, 8),
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

        const [projectInsights] =
            await this.projectReadModel.getProjectsForInsights({
                id: projectId,
            });
        const totalFlags = projectInsights?.featureCount || 0;
        const potentiallyStaleFlags =
            projectInsights?.potentiallyStaleFeatureCount || 0;
        const staleFlags = projectInsights?.staleFeatureCount || 0;
        const currentHealth = projectInsights?.health || 0;
        const technicalDebt = projectInsights?.technicalDebt || 0;

        return {
            latestEvents,
            onboardingStatus,
            owners,
            roles,
            insights: {
                avgHealthCurrentWindow,
                avgHealthPastWindow,
                totalFlags,
                potentiallyStaleFlags,
                staleFlags,
                activeFlags: totalFlags - staleFlags - potentiallyStaleFlags,
                technicalDebt,
                /**
                 * @deprecated
                 */
                health: currentHealth,
            },
        };
    }

    async getAdmins(): Promise<MinimalUser[]> {
        return this.accountStore.getAdmins();
    }
}
