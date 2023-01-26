import { subDays } from 'date-fns';
import User, { IUser } from '../types/user';
import { AccessService } from './access-service';
import NameExistsError from '../error/name-exists-error';
import InvalidOperationError from '../error/invalid-operation-error';
import { nameType } from '../routes/util';
import { projectSchema } from './project-schema';
import NotFoundError from '../error/notfound-error';
import {
    PROJECT_CREATED,
    PROJECT_DELETED,
    PROJECT_UPDATED,
    ProjectUserAddedEvent,
    ProjectUserRemovedEvent,
    ProjectUserUpdateRoleEvent,
    ProjectGroupAddedEvent,
    ProjectGroupRemovedEvent,
    ProjectGroupUpdateRoleEvent,
    FEATURE_ENVIRONMENT_ENABLED,
} from '../types/events';
import { IUnleashStores, IUnleashConfig, IAccountStore } from '../types';
import {
    FeatureToggle,
    IProject,
    IProjectOverview,
    IProjectWithCount,
    IUserWithRole,
    RoleName,
} from '../types/model';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { IFeatureTypeStore } from '../types/stores/feature-type-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import { IProjectQuery, IProjectStore } from '../types/stores/project-store';
import {
    IProjectAccessModel,
    IRoleDescriptor,
} from '../types/stores/access-store';
import { IEventStore } from '../types/stores/event-store';
import FeatureToggleService from './feature-toggle-service';
import { MOVE_FEATURE_TOGGLE } from '../types/permissions';
import NoAccessError from '../error/no-access-error';
import IncompatibleProjectError from '../error/incompatible-project-error';
import { DEFAULT_PROJECT } from '../types/project';
import { IFeatureTagStore } from 'lib/types/stores/feature-tag-store';
import ProjectWithoutOwnerError from '../error/project-without-owner-error';
import { arraysHaveSameItems } from '../util/arraysHaveSameItems';
import { GroupService } from './group-service';
import { IGroupModelWithProjectRole, IGroupRole } from 'lib/types/group';
import { FavoritesService } from './favorites-service';
import { ProjectStatus } from '../read-models/project-status/project-status';
import { IProjectStatusStore } from 'lib/types/stores/project-status-store-type';

const getCreatedBy = (user: IUser) => user.email || user.username;

export interface AccessWithRoles {
    users: IUserWithRole[];
    roles: IRoleDescriptor[];
    groups: IGroupModelWithProjectRole[];
}

export interface IProjectStats {
    avgTimeToProdCurrentWindow: number;
    avgTimeToProdPastWindow: number;
    createdCurrentWindow: number;
    createdPastWindow: number;
    archivedCurrentWindow: number;
    archivedPastWindow: number;
    projectActivityCurrentWindow: number;
    projectActivityPastWindow: number;
}

interface ICalculateStatus {
    projectId: string;
    updates: IProjectStats;
}

export default class ProjectService {
    private store: IProjectStore;

    private accessService: AccessService;

    private eventStore: IEventStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureTypeStore: IFeatureTypeStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private environmentStore: IEnvironmentStore;

    private groupService: GroupService;

    private logger: any;

    private featureToggleService: FeatureToggleService;

    private tagStore: IFeatureTagStore;

    private accountStore: IAccountStore;

    private favoritesService: FavoritesService;

    private projectStatusStore: IProjectStatusStore;

    constructor(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            featureTypeStore,
            environmentStore,
            featureEnvironmentStore,
            featureTagStore,
            accountStore,
            projectStatusStore,
        }: Pick<
            IUnleashStores,
            | 'projectStore'
            | 'eventStore'
            | 'featureToggleStore'
            | 'featureTypeStore'
            | 'environmentStore'
            | 'featureEnvironmentStore'
            | 'featureTagStore'
            | 'accountStore'
            | 'projectStatusStore'
        >,
        config: IUnleashConfig,
        accessService: AccessService,
        featureToggleService: FeatureToggleService,
        groupService: GroupService,
        favoriteService: FavoritesService,
    ) {
        this.store = projectStore;
        this.environmentStore = environmentStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.accessService = accessService;
        this.eventStore = eventStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleService = featureToggleService;
        this.favoritesService = favoriteService;
        this.tagStore = featureTagStore;
        this.accountStore = accountStore;
        this.groupService = groupService;
        this.projectStatusStore = projectStatusStore;
        this.logger = config.getLogger('services/project-service.js');
    }

    async getProjects(
        query?: IProjectQuery,
        userId?: number,
    ): Promise<IProjectWithCount[]> {
        return this.store.getProjectsWithCounts(query, userId);
    }

    async getProject(id: string): Promise<IProject> {
        return this.store.get(id);
    }

    async createProject(
        newProject: Pick<IProject, 'id' | 'name'>,
        user: IUser,
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

    async addEnvironmentToProject(
        project: string,
        environment: string,
    ): Promise<void> {
        await this.store.addEnvironmentToProject(project, environment);
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
            getCreatedBy(user),
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
    async getAccessToProject(projectId: string): Promise<AccessWithRoles> {
        const [roles, users, groups] =
            await this.accessService.getProjectRoleAccess(projectId);

        return {
            roles,
            users,
            groups,
        };
    }

    async addUser(
        projectId: string,
        roleId: number,
        userId: number,
        createdBy: string,
    ): Promise<void> {
        const [roles, users] = await this.accessService.getProjectRoleAccess(
            projectId,
        );
        const user = await this.accountStore.get(userId);

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
                createdBy: createdBy || 'system-user',
                data: {
                    roleId,
                    userId,
                    roleName: role.name,
                    email: user.email,
                },
            }),
        );
    }

    async removeUser(
        projectId: string,
        roleId: number,
        userId: number,
        createdBy: string,
    ): Promise<void> {
        const role = await this.findProjectRole(projectId, roleId);

        await this.validateAtLeastOneOwner(projectId, role);

        await this.accessService.removeUserFromRole(userId, role.id, projectId);

        const user = await this.accountStore.get(userId);

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

    async addGroup(
        projectId: string,
        roleId: number,
        groupId: number,
        modifiedBy: string,
    ): Promise<void> {
        const role = await this.accessService.getRole(roleId);
        const group = await this.groupService.getGroup(groupId);
        const project = await this.getProject(projectId);

        await this.accessService.addGroupToRole(
            group.id,
            role.id,
            modifiedBy,
            project.id,
        );

        await this.eventStore.store(
            new ProjectGroupAddedEvent({
                project: project.id,
                createdBy: modifiedBy,
                data: {
                    groupId: group.id,
                    projectId: project.id,
                    roleName: role.name,
                },
            }),
        );
    }

    async removeGroup(
        projectId: string,
        roleId: number,
        groupId: number,
        modifiedBy: string,
    ): Promise<void> {
        const group = await this.groupService.getGroup(groupId);
        const role = await this.accessService.getRole(roleId);
        const project = await this.getProject(projectId);

        await this.accessService.removeGroupFromRole(
            group.id,
            role.id,
            project.id,
        );

        await this.eventStore.store(
            new ProjectGroupRemovedEvent({
                project: projectId,
                createdBy: modifiedBy,
                preData: {
                    groupId: group.id,
                    projectId: project.id,
                    roleName: role.name,
                },
            }),
        );
    }

    async addAccess(
        projectId: string,
        roleId: number,
        usersAndGroups: IProjectAccessModel,
        createdBy: string,
    ): Promise<void> {
        return this.accessService.addAccessToProject(
            usersAndGroups.users,
            usersAndGroups.groups,
            projectId,
            roleId,
            createdBy,
        );
    }

    async findProjectGroupRole(
        projectId: string,
        roleId: number,
    ): Promise<IGroupRole> {
        const roles = await this.groupService.getRolesForProject(projectId);
        const role = roles.find((r) => r.roleId === roleId);
        if (!role) {
            throw new NotFoundError(
                `Couldn't find roleId=${roleId} on project=${projectId}`,
            );
        }
        return role;
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
            const groups = await this.groupService.getProjectGroups(projectId);
            const roleGroups = groups.filter((g) => g.roleId == currentRole.id);
            if (users.length + roleGroups.length < 2) {
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
        const usersWithRoles = await this.getAccessToProject(projectId);
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

    async changeGroupRole(
        projectId: string,
        roleId: number,
        userId: number,
        createdBy: string,
    ): Promise<void> {
        const usersWithRoles = await this.getAccessToProject(projectId);
        const user = usersWithRoles.groups.find((u) => u.id === userId);
        const currentRole = usersWithRoles.roles.find(
            (r) => r.id === user.roleId,
        );

        if (currentRole.id === roleId) {
            // Nothing to do....
            return;
        }

        await this.validateAtLeastOneOwner(projectId, currentRole);

        await this.accessService.updateGroupProjectRole(
            userId,
            roleId,
            projectId,
        );
        const role = await this.findProjectGroupRole(projectId, roleId);

        await this.eventStore.store(
            new ProjectGroupUpdateRoleEvent({
                project: projectId,
                createdBy,
                preData: {
                    userId,
                    roleId: currentRole.id,
                    roleName: currentRole.name,
                },
                data: {
                    userId,
                    roleId,
                    roleName: role.name,
                },
            }),
        );
    }

    async getMembers(projectId: string): Promise<number> {
        return this.store.getMembersCountByProject(projectId);
    }

    async getProjectsByUser(userId: number): Promise<string[]> {
        return this.store.getProjectsByUser(userId);
    }

    async statusJob(): Promise<void> {
        const projects = await this.store.getAll();

        const statusUpdates = await Promise.all(
            projects.map((project) => this.getStatusUpdates(project.id)),
        );

        await Promise.all(
            statusUpdates.map((statusUpdate) => {
                return this.projectStatusStore.updateStatus(
                    statusUpdate.projectId,
                    statusUpdate.updates,
                );
            }),
        );
    }

    async getStatusUpdates(projectId: string): Promise<ICalculateStatus> {
        // Get all features for project with type release
        const features = await this.featureToggleStore.getAll({
            type: 'release',
            project: projectId,
        });

        const [createdCurrentWindow, createdPastWindow] = await Promise.all([
            await this.featureToggleStore.getByDate({
                project: projectId,
                dateAccessor: 'created_at',
                date: subDays(new Date(), 30).toISOString(),
            }),
            await this.featureToggleStore.getByDate({
                project: projectId,
                dateAccessor: 'created_at',
                range: [
                    subDays(new Date(), 60).toISOString(),
                    subDays(new Date(), 30).toISOString(),
                ],
            }),
        ]);

        const [archivedCurrentWindow, archivedPastWindow] = await Promise.all([
            await this.featureToggleStore.getByDate({
                project: projectId,
                archived: true,
                dateAccessor: 'archived_at',
                date: subDays(new Date(), 30).toISOString(),
            }),
            await this.featureToggleStore.getByDate({
                project: projectId,
                archived: true,
                dateAccessor: 'archived_at',
                range: [
                    subDays(new Date(), 60).toISOString(),
                    subDays(new Date(), 30).toISOString(),
                ],
            }),
        ]);

        const [projectActivityCurrentWindow, projectActivityPastWindow] =
            await Promise.all([
                this.eventStore.query([
                    { op: 'where', parameters: { project: projectId } },
                    {
                        op: 'beforeDate',
                        parameters: {
                            dateAccessor: 'created_at',
                            date: subDays(new Date(), 30).toISOString(),
                        },
                    },
                ]),
                this.eventStore.query([
                    { op: 'where', parameters: { project: projectId } },
                    {
                        op: 'betweenDate',
                        parameters: {
                            dateAccessor: 'created_at',
                            range: [
                                subDays(new Date(), 60).toISOString(),
                                subDays(new Date(), 30).toISOString(),
                            ],
                        },
                    },
                ]),
            ]);

        // Get all project environments with type of production
        const productionEnvironments =
            await this.environmentStore.getProjectEnvironments(projectId, {
                type: 'production',
            });

        // Get all events for features that correspond to feature toggle environment ON
        // Filter out events that are not a production evironment

        const eventsCurrentWindow = await this.eventStore.query([
            {
                op: 'forFeatures',
                parameters: {
                    features: features.map((feature) => feature.name),
                    environments: productionEnvironments.map((env) => env.name),
                    type: FEATURE_ENVIRONMENT_ENABLED,
                    projectId,
                },
            },
            {
                op: 'beforeDate',
                parameters: {
                    dateAccessor: 'created_at',
                    date: subDays(new Date(), 30).toISOString(),
                },
            },
        ]);

        const eventsPastWindow = await this.eventStore.query([
            {
                op: 'forFeatures',
                parameters: {
                    features: features.map((feature) => feature.name),
                    environments: productionEnvironments.map((env) => env.name),
                    type: FEATURE_ENVIRONMENT_ENABLED,
                    projectId,
                },
            },
            {
                op: 'betweenDate',
                parameters: {
                    dateAccessor: 'created_at',
                    range: [
                        subDays(new Date(), 60).toISOString(),
                        subDays(new Date(), 30).toISOString(),
                    ],
                },
            },
        ]);

        const currentWindowTimeToProd = new ProjectStatus(
            features,
            productionEnvironments,
            eventsCurrentWindow,
        );

        const pastWindowTimeToProd = new ProjectStatus(
            features,
            productionEnvironments,
            eventsPastWindow,
        );

        return {
            projectId,
            updates: {
                avgTimeToProdCurrentWindow:
                    currentWindowTimeToProd.calculateAverageTimeToProd(),
                avgTimeToProdPastWindow:
                    pastWindowTimeToProd.calculateAverageTimeToProd(),
                createdCurrentWindow: createdCurrentWindow.length,
                createdPastWindow: createdPastWindow.length,
                archivedCurrentWindow: archivedCurrentWindow.length,
                archivedPastWindow: archivedPastWindow.length,
                projectActivityCurrentWindow:
                    projectActivityCurrentWindow.length,
                projectActivityPastWindow: projectActivityPastWindow.length,
            },
        };
    }

    async getProjectOverview(
        projectId: string,
        archived: boolean = false,
        userId?: number,
    ): Promise<IProjectOverview> {
        const project = await this.store.get(projectId);
        const environments = await this.store.getEnvironmentsForProject(
            projectId,
        );
        const features = await this.featureToggleService.getFeatureOverview({
            projectId,
            archived,
            userId,
        });
        const members = await this.store.getMembersCountByProject(projectId);

        const favorite = await this.favoritesService.isFavoriteProject({
            project: projectId,
            userId,
        });
        return {
            name: project.name,
            description: project.description,
            health: project.health,
            favorite: favorite,
            updatedAt: project.updatedAt,
            environments,
            features,
            members,
            version: 1,
        };
    }
}
