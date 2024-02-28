import { subDays } from 'date-fns';
import { ValidationError } from 'joi';
import { IUser } from '../../types/user';
import { AccessService, AccessWithRoles } from '../../services/access-service';
import NameExistsError from '../../error/name-exists-error';
import InvalidOperationError from '../../error/invalid-operation-error';
import { nameType } from '../../routes/util';
import { projectSchema } from '../../services/project-schema';
import NotFoundError from '../../error/notfound-error';
import {
    CreateProject,
    DEFAULT_PROJECT,
    FeatureToggle,
    IAccountStore,
    IEnvironmentStore,
    IEventStore,
    IFeatureEnvironmentStore,
    IFeatureNaming,
    IFeatureToggleStore,
    IFlagResolver,
    IProject,
    IProjectApplications,
    IProjectHealth,
    IProjectOverview,
    IProjectRoleUsage,
    IProjectStore,
    IProjectUpdate,
    IProjectWithCount,
    IUnleashConfig,
    IUnleashStores,
    MOVE_FEATURE_TOGGLE,
    PROJECT_CREATED,
    PROJECT_DELETED,
    PROJECT_UPDATED,
    ProjectAccessAddedEvent,
    ProjectAccessGroupRolesUpdated,
    ProjectAccessUserRolesDeleted,
    ProjectAccessUserRolesUpdated,
    ProjectGroupAddedEvent,
    ProjectGroupRemovedEvent,
    ProjectGroupUpdateRoleEvent,
    ProjectUserAddedEvent,
    ProjectUserRemovedEvent,
    ProjectUserUpdateRoleEvent,
    RoleName,
    SYSTEM_USER,
} from '../../types';
import {
    IProjectAccessModel,
    IRoleDescriptor,
    IRoleWithProject,
} from '../../types/stores/access-store';
import FeatureToggleService from '../feature-toggle/feature-toggle-service';
import IncompatibleProjectError from '../../error/incompatible-project-error';
import ProjectWithoutOwnerError from '../../error/project-without-owner-error';
import { arraysHaveSameItems } from '../../util';
import { GroupService } from '../../services/group-service';
import { IGroupRole } from '../../types/group';
import { FavoritesService } from '../../services/favorites-service';
import { calculateAverageTimeToProd } from '../feature-toggle/time-to-production/time-to-production';
import { IProjectStatsStore } from '../../types/stores/project-stats-store-type';
import { uniqueByKey } from '../../util/unique';
import { BadDataError, PermissionError } from '../../error';
import { ProjectDoraMetricsSchema } from '../../openapi';
import { checkFeatureNamingData } from '../feature-naming-pattern/feature-naming-validation';
import { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import EventService from '../events/event-service';
import {
    IProjectApplicationsSearchParams,
    IProjectEnterpriseSettingsUpdate,
    IProjectQuery,
} from './project-store-type';

const getCreatedBy = (user: IUser) => user.email || user.username || 'unknown';

type Days = number;
type Count = number;

export interface IProjectStats {
    avgTimeToProdCurrentWindow: Days;
    createdCurrentWindow: Count;
    createdPastWindow: Count;
    archivedCurrentWindow: Count;
    archivedPastWindow: Count;
    projectActivityCurrentWindow: Count;
    projectActivityPastWindow: Count;
    projectMembersAddedCurrentWindow: Count;
}

interface ICalculateStatus {
    projectId: string;
    updates: IProjectStats;
}

function includes(
    list: number[],
    {
        id,
    }: {
        id: number;
    },
): boolean {
    return list.some((l) => l === id);
}

export default class ProjectService {
    private projectStore: IProjectStore;

    private accessService: AccessService;

    private eventStore: IEventStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private environmentStore: IEnvironmentStore;

    private groupService: GroupService;

    private logger: any;

    private featureToggleService: FeatureToggleService;

    private privateProjectChecker: IPrivateProjectChecker;

    private accountStore: IAccountStore;

    private favoritesService: FavoritesService;

    private eventService: EventService;

    private projectStatsStore: IProjectStatsStore;

    private flagResolver: IFlagResolver;

    private isEnterprise: boolean;

    constructor(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            environmentStore,
            featureEnvironmentStore,
            accountStore,
            projectStatsStore,
        }: Pick<
            IUnleashStores,
            | 'projectStore'
            | 'eventStore'
            | 'featureToggleStore'
            | 'environmentStore'
            | 'featureEnvironmentStore'
            | 'accountStore'
            | 'projectStatsStore'
        >,
        config: IUnleashConfig,
        accessService: AccessService,
        featureToggleService: FeatureToggleService,
        groupService: GroupService,
        favoriteService: FavoritesService,
        eventService: EventService,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.projectStore = projectStore;
        this.environmentStore = environmentStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.accessService = accessService;
        this.eventStore = eventStore;
        this.featureToggleStore = featureToggleStore;
        this.featureToggleService = featureToggleService;
        this.favoritesService = favoriteService;
        this.privateProjectChecker = privateProjectChecker;
        this.accountStore = accountStore;
        this.groupService = groupService;
        this.eventService = eventService;
        this.projectStatsStore = projectStatsStore;
        this.logger = config.getLogger('services/project-service.js');
        this.flagResolver = config.flagResolver;
        this.isEnterprise = config.isEnterprise;
    }

    async getProjects(
        query?: IProjectQuery,
        userId?: number,
    ): Promise<IProjectWithCount[]> {
        const projects = await this.projectStore.getProjectsWithCounts(
            query,
            userId,
        );

        if (userId) {
            const projectAccess =
                await this.privateProjectChecker.getUserAccessibleProjects(
                    userId,
                );

            if (projectAccess.mode === 'all') {
                return projects;
            } else {
                return projects.filter((project) =>
                    projectAccess.projects.includes(project.id),
                );
            }
        }
        return projects;
    }

    async getProject(id: string): Promise<IProject> {
        return this.projectStore.get(id);
    }

    private validateAndProcessFeatureNamingPattern = (
        featureNaming: IFeatureNaming,
    ): IFeatureNaming => {
        const validationResult = checkFeatureNamingData(featureNaming);

        if (validationResult.state === 'invalid') {
            const [firstReason, ...remainingReasons] =
                validationResult.reasons.map((message) => ({
                    message,
                }));
            throw new BadDataError(
                'The feature naming pattern data you provided was invalid.',
                [firstReason, ...remainingReasons],
            );
        }

        if (featureNaming.pattern && !featureNaming.example) {
            featureNaming.example = null;
        }
        if (featureNaming.pattern && !featureNaming.description) {
            featureNaming.description = null;
        }

        return featureNaming;
    };

    async createProject(
        newProject: CreateProject,
        user: IUser,
    ): Promise<IProject> {
        const validatedData = await projectSchema.validateAsync(newProject);
        const data = this.removeModeForNonEnterprise(validatedData);
        await this.validateUniqueId(data.id);

        await this.projectStore.create(data);

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

        await this.eventService.storeEvent({
            type: PROJECT_CREATED,
            createdBy: getCreatedBy(user),
            createdByUserId: user.id,
            data,
            project: newProject.id,
        });

        return data;
    }

    async updateProject(
        updatedProject: IProjectUpdate,
        user: IUser,
    ): Promise<void> {
        const preData = await this.projectStore.get(updatedProject.id);

        await this.projectStore.update(updatedProject);

        // updated project contains instructions to update the project but it may not represent a whole project
        const afterData = await this.projectStore.get(updatedProject.id);

        await this.eventService.storeEvent({
            type: PROJECT_UPDATED,
            project: updatedProject.id,
            createdBy: getCreatedBy(user),
            createdByUserId: user.id,
            data: afterData,
            preData,
        });
    }

    async updateProjectEnterpriseSettings(
        updatedProject: IProjectEnterpriseSettingsUpdate,
        user: IUser,
    ): Promise<void> {
        const preData = await this.projectStore.get(updatedProject.id);

        if (updatedProject.featureNaming) {
            this.validateAndProcessFeatureNamingPattern(
                updatedProject.featureNaming,
            );
        }

        await this.projectStore.updateProjectEnterpriseSettings(updatedProject);

        await this.eventService.storeEvent({
            type: PROJECT_UPDATED,
            project: updatedProject.id,
            createdBy: getCreatedBy(user),
            createdByUserId: user.id,
            data: { ...preData, ...updatedProject },
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
        const newEnvs =
            await this.projectStore.getEnvironmentsForProject(newProjectId);
        return arraysHaveSameItems(
            featureEnvs.map((env) => env.environment),
            newEnvs.map((projectEnv) => projectEnv.environment),
        );
    }

    async addEnvironmentToProject(
        project: string,
        environment: string,
    ): Promise<void> {
        await this.projectStore.addEnvironmentToProject(project, environment);
    }

    async changeProject(
        newProjectId: string,
        featureName: string,
        user: IUser,
        currentProjectId: string,
    ): Promise<any> {
        const feature = await this.featureToggleStore.get(featureName);

        if (feature.project !== currentProjectId) {
            throw new PermissionError(MOVE_FEATURE_TOGGLE);
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
            throw new PermissionError(MOVE_FEATURE_TOGGLE);
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
            user.id,
        );
        await this.featureToggleService.updateFeatureStrategyProject(
            featureName,
            newProjectId,
        );

        return updatedFeature;
    }

    async deleteProject(id: string, user: IUser): Promise<void> {
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

        const archivedToggles = await this.featureToggleStore.getAll({
            project: id,
            archived: true,
        });

        this.featureToggleService.deleteFeatures(
            archivedToggles.map((toggle) => toggle.name),
            id,
            user.name,
            user.id,
        );

        await this.projectStore.delete(id);

        await this.eventService.storeEvent({
            type: PROJECT_DELETED,
            createdBy: getCreatedBy(user),
            project: id,
            createdByUserId: user.id,
        });

        await this.accessService.removeDefaultProjectRoles(user, id);
    }

    async validateId(id: string): Promise<boolean> {
        await nameType.validateAsync(id);
        await this.validateUniqueId(id);
        return true;
    }

    async validateUniqueId(id: string): Promise<void> {
        const exists = await this.projectStore.hasProject(id);
        if (exists) {
            throw new NameExistsError('A project with this id already exists.');
        }
    }

    // RBAC methods
    async getAccessToProject(projectId: string): Promise<AccessWithRoles> {
        return this.accessService.getProjectRoleAccess(projectId);
    }

    /**
     * @deprecated see addAccess instead.
     */
    async addUser(
        projectId: string,
        roleId: number,
        userId: number,
        createdBy: string,
    ): Promise<void> {
        const { roles, users } =
            await this.accessService.getProjectRoleAccess(projectId);
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

        await this.eventService.storeEvent(
            new ProjectUserAddedEvent({
                project: projectId,
                createdBy: createdBy || SYSTEM_USER.username,
                createdByUserId: user.id || SYSTEM_USER.id,
                data: {
                    roleId,
                    userId,
                    roleName: role.name,
                    email: user.email,
                },
            }),
        );
    }

    /**
     * @deprecated use removeUserAccess
     */
    async removeUser(
        projectId: string,
        roleId: number,
        userId: number,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        const role = await this.findProjectRole(projectId, roleId);

        await this.validateAtLeastOneOwner(projectId, role);

        await this.accessService.removeUserFromRole(userId, role.id, projectId);

        const user = await this.accountStore.get(userId);

        await this.eventService.storeEvent(
            new ProjectUserRemovedEvent({
                project: projectId,
                createdBy,
                createdByUserId,
                preData: {
                    roleId,
                    userId,
                    roleName: role.name,
                    email: user.email,
                },
            }),
        );
    }

    async removeUserAccess(
        projectId: string,
        userId: number,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        const existingRoles = await this.accessService.getProjectRolesForUser(
            projectId,
            userId,
        );

        const ownerRole = await this.accessService.getRoleByName(
            RoleName.OWNER,
        );

        if (existingRoles.includes(ownerRole.id)) {
            await this.validateAtLeastOneOwner(projectId, ownerRole);
        }

        await this.accessService.removeUserAccess(projectId, userId);

        await this.eventService.storeEvent(
            new ProjectAccessUserRolesDeleted({
                project: projectId,
                createdBy,
                createdByUserId,
                preData: {
                    roles: existingRoles,
                    userId,
                },
            }),
        );
    }

    async removeGroupAccess(
        projectId: string,
        groupId: number,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        const existingRoles = await this.accessService.getProjectRolesForGroup(
            projectId,
            groupId,
        );

        const ownerRole = await this.accessService.getRoleByName(
            RoleName.OWNER,
        );

        if (existingRoles.includes(ownerRole.id)) {
            await this.validateAtLeastOneOwner(projectId, ownerRole);
        }

        await this.accessService.removeGroupAccess(projectId, groupId);

        await this.eventService.storeEvent(
            new ProjectAccessUserRolesDeleted({
                project: projectId,
                createdBy,
                createdByUserId,
                preData: {
                    roles: existingRoles,
                    groupId,
                },
            }),
        );
    }

    async addGroup(
        projectId: string,
        roleId: number,
        groupId: number,
        modifiedBy: string,
        modifiedById: number,
    ): Promise<void> {
        const role = await this.accessService.getRole(roleId);
        const group = await this.groupService.getGroup(groupId);
        const project = await this.getProject(projectId);
        if (group.id == null)
            throw new ValidationError(
                'Unexpected empty group id',
                [],
                undefined,
            );

        await this.accessService.addGroupToRole(
            group.id,
            role.id,
            modifiedBy,
            project.id,
        );

        await this.eventService.storeEvent(
            new ProjectGroupAddedEvent({
                project: project.id,
                createdBy: modifiedBy,
                createdByUserId: modifiedById,
                data: {
                    groupId: group.id,
                    projectId: project.id,
                    roleName: role.name,
                },
            }),
        );
    }

    /**
     * @deprecated use removeGroupAccess
     */
    async removeGroup(
        projectId: string,
        roleId: number,
        groupId: number,
        modifiedBy: string,
        modifiedById: number,
    ): Promise<void> {
        const group = await this.groupService.getGroup(groupId);
        const role = await this.accessService.getRole(roleId);
        const project = await this.getProject(projectId);
        if (group.id == null)
            throw new ValidationError(
                'Unexpected empty group id',
                [],
                undefined,
            );

        await this.validateAtLeastOneOwner(projectId, role);

        await this.accessService.removeGroupFromRole(
            group.id,
            role.id,
            project.id,
        );

        await this.eventService.storeEvent(
            new ProjectGroupRemovedEvent({
                project: projectId,
                createdBy: modifiedBy,
                createdByUserId: modifiedById,
                preData: {
                    groupId: group.id,
                    projectId: project.id,
                    roleName: role.name,
                },
            }),
        );
    }

    async addRoleAccess(
        projectId: string,
        roleId: number,
        usersAndGroups: IProjectAccessModel,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        await this.accessService.addRoleAccessToProject(
            usersAndGroups.users,
            usersAndGroups.groups,
            projectId,
            roleId,
            createdBy,
        );

        await this.eventService.storeEvent(
            new ProjectAccessAddedEvent({
                project: projectId,
                createdBy,
                createdByUserId,
                data: {
                    roles: {
                        roleId,
                        groupIds: usersAndGroups.groups.map(({ id }) => id),
                        userIds: usersAndGroups.users.map(({ id }) => id),
                    },
                },
            }),
        );
    }

    private isAdmin(roles: IRoleWithProject[]): boolean {
        return roles.some((r) => r.name === RoleName.ADMIN);
    }

    private isProjectOwner(
        roles: IRoleWithProject[],
        project: string,
    ): boolean {
        return roles.some(
            (r) => r.project === project && r.name === RoleName.OWNER,
        );
    }
    private async isAllowedToAddAccess(
        userAddingAccess: number,
        projectId: string,
        rolesBeingAdded: number[],
    ): Promise<boolean> {
        const userRoles = await this.accessService.getAllProjectRolesForUser(
            userAddingAccess,
            projectId,
        );
        if (
            this.isAdmin(userRoles) ||
            this.isProjectOwner(userRoles, projectId)
        ) {
            return true;
        }
        return rolesBeingAdded.every((roleId) =>
            userRoles.some((userRole) => userRole.id === roleId),
        );
    }
    async addAccess(
        projectId: string,
        roles: number[],
        groups: number[],
        users: number[],
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        if (
            await this.isAllowedToAddAccess(createdByUserId, projectId, roles)
        ) {
            await this.accessService.addAccessToProject(
                roles,
                groups,
                users,
                projectId,
                createdBy,
            );

            await this.eventService.storeEvent(
                new ProjectAccessAddedEvent({
                    project: projectId,
                    createdBy,
                    createdByUserId,
                    data: {
                        roles: roles.map((roleId) => {
                            return {
                                roleId,
                                groupIds: groups,
                                userIds: users,
                            };
                        }),
                    },
                }),
            );
        } else {
            throw new InvalidOperationError(
                'User tried to grant role they did not have access to',
            );
        }
    }

    async setRolesForUser(
        projectId: string,
        userId: number,
        newRoles: number[],
        createdByUserName: string,
        createdByUserId: number,
    ): Promise<void> {
        const currentRoles = await this.accessService.getProjectRolesForUser(
            projectId,
            userId,
        );
        const ownerRole = await this.accessService.getRoleByName(
            RoleName.OWNER,
        );

        const hasOwnerRole = includes(currentRoles, ownerRole);
        const isRemovingOwnerRole = !includes(newRoles, ownerRole);
        if (hasOwnerRole && isRemovingOwnerRole) {
            await this.validateAtLeastOneOwner(projectId, ownerRole);
        }
        const isAllowedToAssignRoles = await this.isAllowedToAddAccess(
            createdByUserId,
            projectId,
            newRoles,
        );
        if (isAllowedToAssignRoles) {
            await this.accessService.setProjectRolesForUser(
                projectId,
                userId,
                newRoles,
            );
            await this.eventService.storeEvent(
                new ProjectAccessUserRolesUpdated({
                    project: projectId,
                    createdBy: createdByUserName,
                    createdByUserId,
                    data: {
                        roles: newRoles,
                        userId,
                    },
                    preData: {
                        roles: currentRoles,
                        userId,
                    },
                }),
            );
        } else {
            throw new InvalidOperationError(
                'User tried to assign a role they did not have access to',
            );
        }
    }

    async setRolesForGroup(
        projectId: string,
        groupId: number,
        newRoles: number[],
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        const currentRoles = await this.accessService.getProjectRolesForGroup(
            projectId,
            groupId,
        );

        const ownerRole = await this.accessService.getRoleByName(
            RoleName.OWNER,
        );
        const hasOwnerRole = includes(currentRoles, ownerRole);
        const isRemovingOwnerRole = !includes(newRoles, ownerRole);
        if (hasOwnerRole && isRemovingOwnerRole) {
            await this.validateAtLeastOneOwner(projectId, ownerRole);
        }
        const isAllowedToAssignRoles = await this.isAllowedToAddAccess(
            createdByUserId,
            projectId,
            newRoles,
        );
        if (isAllowedToAssignRoles) {
            await this.accessService.setProjectRolesForGroup(
                projectId,
                groupId,
                newRoles,
                createdBy,
            );
            await this.eventService.storeEvent(
                new ProjectAccessGroupRolesUpdated({
                    project: projectId,
                    createdBy,
                    createdByUserId,
                    data: {
                        roles: newRoles,
                        groupId,
                    },
                    preData: {
                        roles: currentRoles,
                        groupId,
                    },
                }),
            );
        } else {
            throw new InvalidOperationError(
                'User tried to assign a role they did not have access to',
            );
        }
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
            const roleGroups = groups.filter(
                (g) => g.roleId === currentRole.id,
            );
            if (users.length + roleGroups.length < 2) {
                throw new ProjectWithoutOwnerError();
            }
        }
    }

    async getDoraMetrics(projectId: string): Promise<ProjectDoraMetricsSchema> {
        const activeFeatureToggles = (
            await this.featureToggleStore.getAll({ project: projectId })
        ).map((feature) => feature.name);

        const archivedFeatureToggles = (
            await this.featureToggleStore.getAll({
                project: projectId,
                archived: true,
            })
        ).map((feature) => feature.name);

        const featureToggleNames = [
            ...activeFeatureToggles,
            ...archivedFeatureToggles,
        ];

        const projectAverage = calculateAverageTimeToProd(
            await this.projectStatsStore.getTimeToProdDates(projectId),
        );

        const toggleAverage =
            await this.projectStatsStore.getTimeToProdDatesForFeatureToggles(
                projectId,
                featureToggleNames,
            );

        return {
            features: toggleAverage,
            projectAverage: projectAverage,
        };
    }

    async getApplications(
        searchParams: IProjectApplicationsSearchParams,
    ): Promise<IProjectApplications> {
        const applications =
            await this.projectStore.getApplicationsByProject(searchParams);
        return applications;
    }

    async changeRole(
        projectId: string,
        roleId: number,
        userId: number,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        const usersWithRoles = await this.getAccessToProject(projectId);
        const user = usersWithRoles.users.find((u) => u.id === userId);
        if (!user)
            throw new ValidationError('Unexpected empty user', [], undefined);

        const currentRole = usersWithRoles.roles.find(
            (r) => r.id === user.roleId,
        );
        if (!currentRole)
            throw new ValidationError(
                'Unexpected empty current role',
                [],
                undefined,
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

        await this.eventService.storeEvent(
            new ProjectUserUpdateRoleEvent({
                project: projectId,
                createdBy,
                createdByUserId,
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
        createdByUserId: number,
    ): Promise<void> {
        const usersWithRoles = await this.getAccessToProject(projectId);
        const user = usersWithRoles.groups.find((u) => u.id === userId);
        if (!user)
            throw new ValidationError('Unexpected empty user', [], undefined);
        const currentRole = usersWithRoles.roles.find(
            (r) => r.id === user.roleId,
        );
        if (!currentRole)
            throw new ValidationError(
                'Unexpected empty current role',
                [],
                undefined,
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

        await this.eventService.storeEvent(
            new ProjectGroupUpdateRoleEvent({
                project: projectId,
                createdBy,
                createdByUserId,
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
        return this.projectStore.getMembersCountByProject(projectId);
    }

    async getProjectUsers(
        projectId: string,
    ): Promise<Array<Pick<IUser, 'id' | 'email' | 'username'>>> {
        const { groups, users } =
            await this.accessService.getProjectRoleAccess(projectId);
        const actualUsers = users.map((user) => ({
            id: user.id,
            email: user.email,
            username: user.username,
        }));
        const actualGroupUsers = groups
            .flatMap((group) => group.users)
            .map((user) => user.user)
            .map((user) => ({
                id: user.id,
                email: user.email,
                username: user.username,
            }));
        return uniqueByKey([...actualUsers, ...actualGroupUsers], 'id');
    }

    async isProjectUser(userId: number, projectId: string): Promise<boolean> {
        const users = await this.getProjectUsers(projectId);
        return Boolean(users.find((user) => user.id === userId));
    }

    async getProjectsByUser(userId: number): Promise<string[]> {
        return this.projectStore.getProjectsByUser(userId);
    }

    async getProjectRoleUsage(roleId: number): Promise<IProjectRoleUsage[]> {
        return this.accessService.getProjectRoleUsage(roleId);
    }

    async statusJob(): Promise<void> {
        const projects = await this.projectStore.getAll();

        const statusUpdates = await Promise.all(
            projects.map((project) => this.getStatusUpdates(project.id)),
        );

        await Promise.all(
            statusUpdates.map((statusUpdate) => {
                return this.projectStatsStore.updateProjectStats(
                    statusUpdate.projectId,
                    statusUpdate.updates,
                );
            }),
        );
    }

    async getStatusUpdates(projectId: string): Promise<ICalculateStatus> {
        const dateMinusThirtyDays = subDays(new Date(), 30).toISOString();
        const dateMinusSixtyDays = subDays(new Date(), 60).toISOString();

        const [
            createdCurrentWindow,
            createdPastWindow,
            archivedCurrentWindow,
            archivedPastWindow,
        ] = await Promise.all([
            await this.featureToggleStore.countByDate({
                project: projectId,
                dateAccessor: 'created_at',
                date: dateMinusThirtyDays,
            }),
            await this.featureToggleStore.countByDate({
                project: projectId,
                dateAccessor: 'created_at',
                range: [dateMinusSixtyDays, dateMinusThirtyDays],
            }),
            await this.featureToggleStore.countByDate({
                project: projectId,
                archived: true,
                dateAccessor: 'archived_at',
                date: dateMinusThirtyDays,
            }),
            await this.featureToggleStore.countByDate({
                project: projectId,
                archived: true,
                dateAccessor: 'archived_at',
                range: [dateMinusSixtyDays, dateMinusThirtyDays],
            }),
        ]);

        const [projectActivityCurrentWindow, projectActivityPastWindow] =
            await Promise.all([
                this.eventStore.queryCount([
                    {
                        op: 'where',
                        parameters: { project: projectId },
                    },
                    {
                        op: 'beforeDate',
                        parameters: {
                            dateAccessor: 'created_at',
                            date: dateMinusThirtyDays,
                        },
                    },
                ]),
                this.eventStore.queryCount([
                    {
                        op: 'where',
                        parameters: { project: projectId },
                    },
                    {
                        op: 'betweenDate',
                        parameters: {
                            dateAccessor: 'created_at',
                            range: [dateMinusSixtyDays, dateMinusThirtyDays],
                        },
                    },
                ]),
            ]);

        const avgTimeToProdCurrentWindow = calculateAverageTimeToProd(
            await this.projectStatsStore.getTimeToProdDates(projectId),
        );

        const projectMembersAddedCurrentWindow =
            await this.projectStore.getMembersCountByProjectAfterDate(
                projectId,
                dateMinusThirtyDays,
            );

        return {
            projectId,
            updates: {
                avgTimeToProdCurrentWindow,
                createdCurrentWindow,
                createdPastWindow,
                archivedCurrentWindow,
                archivedPastWindow,
                projectActivityCurrentWindow,
                projectActivityPastWindow,
                projectMembersAddedCurrentWindow,
            },
        };
    }

    async getProjectHealth(
        projectId: string,
        archived: boolean = false,
        userId?: number,
    ): Promise<IProjectHealth> {
        const [
            project,
            environments,
            features,
            members,
            favorite,
            projectStats,
        ] = await Promise.all([
            this.projectStore.get(projectId),
            this.projectStore.getEnvironmentsForProject(projectId),
            this.featureToggleService.getFeatureOverview({
                projectId,
                archived,
                userId,
            }),
            this.projectStore.getMembersCountByProject(projectId),
            userId
                ? this.favoritesService.isFavoriteProject({
                      project: projectId,
                      userId,
                  })
                : Promise.resolve(false),
            this.projectStatsStore.getProjectStats(projectId),
        ]);

        return {
            stats: projectStats,
            name: project.name,
            description: project.description!,
            mode: project.mode,
            featureLimit: project.featureLimit,
            featureNaming: project.featureNaming,
            defaultStickiness: project.defaultStickiness,
            health: project.health || 0,
            favorite: favorite,
            updatedAt: project.updatedAt,
            createdAt: project.createdAt,
            environments,
            features: features,
            members,
            version: 1,
        };
    }

    async getProjectOverview(
        projectId: string,
        archived: boolean = false,
        userId?: number,
    ): Promise<IProjectOverview> {
        const [
            project,
            environments,
            featureTypeCounts,
            members,
            favorite,
            projectStats,
        ] = await Promise.all([
            this.projectStore.get(projectId),
            this.projectStore.getEnvironmentsForProject(projectId),
            this.featureToggleService.getFeatureTypeCounts({
                projectId,
                archived,
                userId,
            }),
            this.projectStore.getMembersCountByProject(projectId),
            userId
                ? this.favoritesService.isFavoriteProject({
                      project: projectId,
                      userId,
                  })
                : Promise.resolve(false),
            this.projectStatsStore.getProjectStats(projectId),
        ]);

        return {
            stats: projectStats,
            name: project.name,
            description: project.description!,
            mode: project.mode,
            featureLimit: project.featureLimit,
            featureNaming: project.featureNaming,
            defaultStickiness: project.defaultStickiness,
            health: project.health || 0,
            favorite: favorite,
            updatedAt: project.updatedAt,
            createdAt: project.createdAt,
            environments,
            featureTypeCounts,
            members,
            version: 1,
        };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    removeModeForNonEnterprise(data): any {
        if (this.isEnterprise) {
            return data;
        }
        const { mode, ...proData } = data;
        return proData;
    }
}
