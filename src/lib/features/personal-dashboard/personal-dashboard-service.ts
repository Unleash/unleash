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
import type { IEventStore } from '../../types';
import type { FeatureEventFormatter } from '../../addons/feature-event-formatter-md';
import { generateImageUrl } from '../../util';

type PersonalProjectDetails = {
    latestEvents: {
        summary: string;
        createdBy: string;
        id: number;
        createdByImageUrl: string;
    }[];
};

export class PersonalDashboardService {
    private personalDashboardReadModel: IPersonalDashboardReadModel;

    private projectOwnersReadModel: IProjectOwnersReadModel;

    private projectReadModel: IProjectReadModel;

    private privateProjectChecker: IPrivateProjectChecker;

    private eventStore: IEventStore;

    private featureEventFormatter: FeatureEventFormatter;

    constructor(
        personalDashboardReadModel: IPersonalDashboardReadModel,
        projectOwnersReadModel: IProjectOwnersReadModel,
        projectReadModel: IProjectReadModel,
        eventStore: IEventStore,
        featureEventFormatter: FeatureEventFormatter,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.personalDashboardReadModel = personalDashboardReadModel;
        this.projectOwnersReadModel = projectOwnersReadModel;
        this.projectReadModel = projectReadModel;
        this.eventStore = eventStore;
        this.featureEventFormatter = featureEventFormatter;
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
    ): Promise<PersonalProjectDetails> {
        const recentEvents = await this.eventStore.searchEvents(
            { limit: 4, offset: 0 },
            [{ field: 'project', operator: 'IS', values: [projectId] }],
        );

        const formattedEvents = recentEvents.map((event) => ({
            summary: this.featureEventFormatter.format(event).text,
            createdBy: event.createdBy,
            id: event.id,
            createdByImageUrl: generateImageUrl({ email: event.createdBy }),
        }));

        return { latestEvents: formattedEvents };
    }
}
