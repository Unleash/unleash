import User from '../types/user';
import { AccessService } from './access-service';
import NameExistsError from '../error/name-exists-error';
import InvalidOperationError from '../error/invalid-operation-error';
import { nameType } from '../routes/util';
import { projectSchema } from './project-schema';
import NotFoundError from '../error/notfound-error';
import {
    ProjectUserAddedEvent,
    ProjectUserRemovedEvent,
    ProjectUserUpdateRoleEvent,
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
    FeatureToggle,
    RoleName,
} from '../types/model';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { IFeatureTypeStore } from '../types/stores/feature-type-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import { IProjectQuery, IProjectStore } from '../types/stores/project-store';
import { IRoleDescriptor } from '../types/stores/access-store';
import { IEventStore } from '../types/stores/event-store';
import FeatureToggleService from './feature-toggle-service';
import { MOVE_FEATURE_TOGGLE } from '../types/permissions';
import NoAccessError from '../error/no-access-error';
import IncompatibleProjectError from '../error/incompatible-project-error';
import { DEFAULT_PROJECT } from '../types/project';
import { IFeatureTagStore } from 'lib/types/stores/feature-tag-store';
import ProjectWithoutOwnerError from '../error/project-without-owner-error';
import { IUserStore } from 'lib/types/stores/user-store';
import { arraysHaveSameItems } from '../util/arraysHaveSameItems';

const getCreatedBy = (user: User) => user.email || user.username;

export interface UsersWithRoles {
    users: IUserWithRole[];
    roles: IRoleDescriptor[];
}

export default class ProjectService {
    private store: IProjectStore;

    private accessService: AccessService;

    private eventStore: IEventStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureTypeStore: IFeatureTypeStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private environmentStore: IEnvironmentStore;

    private logger: any;

    private featureToggleService: FeatureToggleService;

    private tagStore: IFeatureTagStore;

    private userStore: IUserStore;

    constructor(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            featureTypeStore,
            environmentStore,
            featureEnvironmentStore,
            featureTagStore,
            userStore,
        }: Pick<
            IUnleashStores,
            | 'projectStore'
            | 'eventStore'
            | 'featureToggleStore'
            | 'featureTypeStore'
            | 'environmentStore'
            | 'featureEnvironmentStore'
            | 'featureTagStore'
            | 'userStore'
        >,
        config: IUnleashConfig,
        accessService: AccessService,
        featureToggleService: FeatureToggleService,
    ) {
        this.store = projectStore;
        this.environmentStore = environmentStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.accessService = accessService;
        this.eventStore = eventStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleService = featureToggleService;
        this.tagStore = featureTagStore;
        this.userStore = userStore;
        this.logger = config.getLogger('services/project-service.js');
    }

    async getProjects(query?: IProjectQuery): Promise<IProjectWithCount[]> {
        return this.store.getProjectsWithCounts(query);
    }

    async getProject(id: string): Promise<IProject> {
        return this.store.get(id);
    }

    async createProject(
        newProject: Pick<IProject, 'id'>,
        user: User,
    ): Promise<IProject> {
        const data = await projectSchema.validateAsync(newProject);
        await this.validateUniqueId(data.id);

        await this.store.create(data);

        const enabledEnvironments = await this.environmentStore.getAll({
            enabled: true,
        });

        // TODO: Only if enabled!
        await Promise.all(
            enabledEnvironments.map(async (e) => {
                await this.featureEnvironmentStore.connectProject(
                    e.name,
                    data.id,
                );
            }),
        );

        await this.accessService.createDefaultProjectRoles(user, data.id);

        await this.eventStore.store({
            type: PROJECT_CREATED,
            createdBy: getCreatedBy(user),
            data,
            project: newProject.id,
        });

        return data;
    }

    async updateProject(updatedProject: IProject, user: User): Promise<void> {
        const preData = await this.store.get(updatedProject.id);
        const project = await projectSchema.validateAsync(updatedProject);

        await this.store.update(project);

        await this.eventStore.store({
            type: PROJECT_UPDATED,
            project: project.id,
            createdBy: getCreatedBy(user),
            data: project,
            preData,
        });
    }

    async checkProjectsCompatibility(
        feature: FeatureToggle,
        newProjectId: string,
    ): Promise<boolean> {
        const featureEnvs = await this.featureEnvironmentStore.getAll({
            feature_name: feature.name,
        });
        const newEnvs = await this.store.getEnvironmentsForProject(
            newProjectId,
        );
        return arraysHaveSameItems(
            featureEnvs.map((env) => env.environment),
            newEnvs,
        );
    }

    async changeProject(
        newProjectId: string,
        featureName: string,
        user: User,
        currentProjectId: string,
    ): Promise<any> {
        const feature = await this.featureToggleStore.get(featureName);

        if (feature.project !== currentProjectId) {
            throw new NoAccessError(MOVE_FEATURE_TOGGLE);
        }
        const project = await this.getProject(newProjectId);

        if (!project) {
            throw new NotFoundError(`Project ${newProjectId} not found`);
        }

        const authorized = await this.accessService.hasPermission(
            user,
            MOVE_FEATURE_TOGGLE,
            newProjectId,
        );

        if (!authorized) {
            throw new NoAccessError(MOVE_FEATURE_TOGGLE);
        }

        const isCompatibleWithTargetProject =
            await this.checkProjectsCompatibility(feature, newProjectId);
        if (!isCompatibleWithTargetProject) {
            throw new IncompatibleProjectError(newProjectId);
        }
        const updatedFeature = await this.featureToggleService.changeProject(
            featureName,
            newProjectId,
            user.username,
        );
        await this.featureToggleService.updateFeatureStrategyProject(
            featureName,
            newProjectId,
        );

        return updatedFeature;
    }

    async deleteProject(id: string, user: User): Promise<void> {
        if (id === DEFAULT_PROJECT) {
            throw new InvalidOperationError(
                'You can not delete the default project!',
            );
        }

        const toggles = await this.featureToggleStore.getAll({
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
            project: id,
        });

        await this.accessService.removeDefaultProjectRoles(user, id);
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

    // TODO: Remove the optional nature of createdBy - this in place to make sure enterprise is compatible
    async addUser(
        projectId: string,
        roleId: number,
        userId: number,
        createdBy?: string,
    ): Promise<void> {
        const [roles, users] = await this.accessService.getProjectRoleUsers(
            projectId,
        );
        const user = await this.userStore.get(userId);

        const role = roles.find((r) => r.id === roleId);
        if (!role) {
            throw new NotFoundError(
                `Could not find roleId=${roleId} on project=${projectId}`,
            );
        }

        const alreadyHasAccess = users.some((u) => u.id === userId);
        if (alreadyHasAccess) {
            throw new Error(`User already has access to project=${projectId}`);
        }

        await this.accessService.addUserToRole(userId, role.id, projectId);

        await this.eventStore.store(
            new ProjectUserAddedEvent({
                project: projectId,
                createdBy,
                data: {
                    roleId,
                    userId,
                    roleName: role.name,
                    email: user.email,
                },
            }),
        );
    }

    // TODO: Remove the optional nature of createdBy - this in place to make sure enterprise is compatible
    async removeUser(
        projectId: string,
        roleId: number,
        userId: number,
        createdBy?: string,
    ): Promise<void> {
        const role = await this.findProjectRole(projectId, roleId);

        await this.validateAtLeastOneOwner(projectId, role);

        await this.accessService.removeUserFromRole(userId, role.id, projectId);

        const user = await this.userStore.get(userId);

        await this.eventStore.store(
            new ProjectUserRemovedEvent({
                project: projectId,
                createdBy,
                preData: {
                    roleId,
                    userId,
                    roleName: role.name,
                    email: user.email,
                },
            }),
        );
    }

    async findProjectRole(
        projectId: string,
        roleId: number,
    ): Promise<IRoleDescriptor> {
        const roles = await this.accessService.getRolesForProject(projectId);
        const role = roles.find((r) => r.id === roleId);
        if (!role) {
            throw new NotFoundError(
                `Couldn't find roleId=${roleId} on project=${projectId}`,
            );
        }
        return role;
    }

    async validateAtLeastOneOwner(
        projectId: string,
        currentRole: IRoleDescriptor,
    ): Promise<void> {
        if (currentRole.name === RoleName.OWNER) {
            const users = await this.accessService.getProjectUsersForRole(
                currentRole.id,
                projectId,
            );
            if (users.length < 2) {
                throw new ProjectWithoutOwnerError();
            }
        }
    }

    async changeRole(
        projectId: string,
        roleId: number,
        userId: number,
        createdBy: string,
    ): Promise<void> {
        const usersWithRoles = await this.getUsersWithAccess(projectId);
        const user = usersWithRoles.users.find((u) => u.id === userId);
        const currentRole = usersWithRoles.roles.find(
            (r) => r.id === user.roleId,
        );

        if (currentRole.id === roleId) {
            // Nothing to do....
            return;
        }

        await this.validateAtLeastOneOwner(projectId, currentRole);

        await this.accessService.updateUserProjectRole(
            userId,
            roleId,
            projectId,
        );
        const role = await this.findProjectRole(projectId, roleId);

        await this.eventStore.store(
            new ProjectUserUpdateRoleEvent({
                project: projectId,
                createdBy,
                preData: {
                    userId,
                    roleId: currentRole.id,
                    roleName: currentRole.name,
                    email: user.email,
                },
                data: {
                    userId,
                    roleId,
                    roleName: role.name,
                    email: user.email,
                },
            }),
        );
    }

    async getMembers(projectId: string): Promise<number> {
        return this.store.getMembers(projectId);
    }

    async getProjectOverview(
        projectId: string,
        archived: boolean = false,
    ): Promise<IProjectOverview> {
        const project = await this.store.get(projectId);
        const environments = await this.store.getEnvironmentsForProject(
            projectId,
        );
        const features = await this.featureToggleService.getFeatureOverview(
            projectId,
            archived,
        );
        const members = await this.store.getMembers(projectId);
        return {
            name: project.name,
            environments,
            description: project.description,
            health: project.health,
            features,
            members,
            version: 1,
        };
    }
}
