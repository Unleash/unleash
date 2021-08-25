import User from '../types/user';
import { AccessService } from './access-service';
import NameExistsError from '../error/name-exists-error';
import InvalidOperationError from '../error/invalid-operation-error';
import { nameType } from '../routes/util';
import schema from './project-schema';
import NotFoundError from '../error/notfound-error';
import {
    FEATURE_PROJECT_CHANGE,
    PROJECT_CREATED,
    PROJECT_DELETED,
    PROJECT_UPDATED,
} from '../types/events';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import {
    IProject,
    IProjectOverview,
    IProjectWithCount,
    IUserWithRole,
    RoleName,
} from '../types/model';
import { GLOBAL_ENV } from '../types/environment';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { IFeatureTypeStore } from '../types/stores/feature-type-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import { IProjectStore } from '../types/stores/project-store';
import { IRole } from '../types/stores/access-store';
import { IEventStore } from '../types/stores/event-store';
import FeatureToggleServiceV2 from './feature-toggle-service-v2';
import { CREATE_FEATURE, UPDATE_FEATURE } from '../types/permissions';
import NoAccessError from '../error/no-access-error';

const getCreatedBy = (user: User) => user.email || user.username;

const DEFAULT_PROJECT = 'default';

export interface UsersWithRoles {
    users: IUserWithRole[];
    roles: IRole[];
}

export default class ProjectService {
    private store: IProjectStore;

    private accessService: AccessService;

    private eventStore: IEventStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureTypeStore: IFeatureTypeStore;

    private environmentStore: IEnvironmentStore;

    private logger: any;

    private featureToggleService: FeatureToggleServiceV2;

    constructor(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            featureTypeStore,
            environmentStore,
        }: Pick<
            IUnleashStores,
            | 'projectStore'
            | 'eventStore'
            | 'featureToggleStore'
            | 'featureTypeStore'
            | 'environmentStore'
        >,
        config: IUnleashConfig,
        accessService: AccessService,
        featureToggleService: FeatureToggleServiceV2,
    ) {
        this.store = projectStore;
        this.environmentStore = environmentStore;
        this.accessService = accessService;
        this.eventStore = eventStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleService = featureToggleService;
        this.logger = config.getLogger('services/project-service.js');
    }

    async getProjects(): Promise<IProjectWithCount[]> {
        const projects = await this.store.getAll();
        const projectsWithCount = await Promise.all(
            projects.map(async (p) => {
                let featureCount = 0;
                let memberCount = 0;
                try {
                    featureCount =
                        await this.featureToggleService.getFeatureCountForProject(
                            p.id,
                        );
                    memberCount = await this.getMembers(p.id);
                } catch (e) {
                    this.logger.warn('Error fetching project counts', e);
                }
                return { ...p, featureCount, memberCount };
            }),
        );
        return projectsWithCount;
    }

    async getProject(id: string): Promise<IProject> {
        return this.store.get(id);
    }

    async createProject(newProject: IProject, user: User): Promise<IProject> {
        const data = await schema.validateAsync(newProject);
        await this.validateUniqueId(data.id);

        await this.store.create(data);

        await this.environmentStore.connectProject(GLOBAL_ENV, data.id);

        await this.accessService.createDefaultProjectRoles(user, data.id);

        await this.eventStore.store({
            type: PROJECT_CREATED,
            createdBy: getCreatedBy(user),
            data,
        });

        return data;
    }

    async updateProject(updatedProject: IProject, user: User): Promise<void> {
        await this.store.get(updatedProject.id);
        const project = await schema.validateAsync(updatedProject);

        await this.store.update(project);

        await this.eventStore.store({
            type: PROJECT_UPDATED,
            createdBy: getCreatedBy(user),
            data: project,
        });
    }

    async changeProject(
        newProjectId: string,
        featureName: string,
        user: User,
        currentProjectId: string,
    ): Promise<any> {
        const feature = await this.featureToggleStore.get(featureName);

        if (feature.project !== currentProjectId) {
            throw new NoAccessError(UPDATE_FEATURE);
        }

        const project = await this.getProject(newProjectId);

        if (!project) {
            throw new NotFoundError(`Project ${newProjectId} not found`);
        }

        const authorized = await this.accessService.hasPermission(
            user,
            CREATE_FEATURE,
            newProjectId,
        );

        if (!authorized) {
            throw new NoAccessError(CREATE_FEATURE);
        }

        const updatedFeature = await this.featureToggleService.updateField(
            featureName,
            'project',
            newProjectId,
            user.username,
            FEATURE_PROJECT_CHANGE,
        );

        return updatedFeature;
    }

    async deleteProject(id: string, user: User): Promise<void> {
        if (id === DEFAULT_PROJECT) {
            throw new InvalidOperationError(
                'You can not delete the default project!',
            );
        }

        const toggles = await this.featureToggleStore.getFeaturesBy({
            project: id,
            archived: false,
        });

        if (toggles.length > 0) {
            throw new InvalidOperationError(
                'You can not delete a project with active feature toggles',
            );
        }

        await this.store.delete(id);

        await this.eventStore.store({
            type: PROJECT_DELETED,
            createdBy: getCreatedBy(user),
            data: { id },
        });

        this.accessService.removeDefaultProjectRoles(user, id);
    }

    async validateId(id: string): Promise<boolean> {
        await nameType.validateAsync(id);
        await this.validateUniqueId(id);
        return true;
    }

    async validateUniqueId(id: string): Promise<void> {
        const exists = await this.store.hasProject(id);
        if (exists) {
            throw new NameExistsError('A project with this id already exists.');
        }
    }

    // RBAC methods
    async getUsersWithAccess(projectId: string): Promise<UsersWithRoles> {
        const [roles, users] = await this.accessService.getProjectRoleUsers(
            projectId,
        );

        return {
            roles,
            users,
        };
    }

    async addUser(
        projectId: string,
        roleId: number,
        userId: number,
    ): Promise<void> {
        const [roles, users] = await this.accessService.getProjectRoleUsers(
            projectId,
        );

        const role = roles.find((r) => r.id === roleId);
        if (!role) {
            throw new NotFoundError(
                `Could not find roleId=${roleId} on project=${projectId}`,
            );
        }

        const alreadyHasAccess = users.some((u) => u.id === userId);
        if (alreadyHasAccess) {
            throw new Error(`User already have access to project=${projectId}`);
        }

        await this.accessService.addUserToRole(userId, role.id);
    }

    async removeUser(
        projectId: string,
        roleId: number,
        userId: number,
    ): Promise<void> {
        const roles = await this.accessService.getRolesForProject(projectId);
        const role = roles.find((r) => r.id === roleId);
        if (!role) {
            throw new NotFoundError(
                `Couldn't find roleId=${roleId} on project=${projectId}`,
            );
        }

        if (role.name === RoleName.OWNER) {
            const users = await this.accessService.getUsersForRole(role.id);
            if (users.length < 2) {
                throw new Error('A project must have at least one owner');
            }
        }

        await this.accessService.removeUserFromRole(userId, role.id);
    }

    async getMembers(projectId: string): Promise<number> {
        return this.store.getMembers(projectId);
    }

    async getProjectOverview(
        projectId: string,
        archived: boolean = false,
    ): Promise<IProjectOverview> {
        const project = await this.store.get(projectId);
        const features = await this.store.getProjectOverview(
            projectId,
            archived,
        );
        const members = await this.store.getMembers(projectId);
        return {
            name: project.name,
            description: project.description,
            health: project.health,
            features,
            members,
            version: 1,
        };
    }
}

module.exports = ProjectService;
