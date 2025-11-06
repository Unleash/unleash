import { subDays } from 'date-fns';
import joi from 'joi';
const { ValidationError } = joi;
import createSlug from 'slug';
import type { IAuditUser, IUser } from '../../types/user.js';
import type {
    AccessService,
    AccessWithRoles,
} from '../../services/access-service.js';
import NameExistsError from '../../error/name-exists-error.js';
import InvalidOperationError from '../../error/invalid-operation-error.js';
import { nameType } from '../../routes/util.js';
import { projectSchema } from '../../services/project-schema.js';
import NotFoundError from '../../error/notfound-error.js';
import {
    ADMIN,
    ADMIN_TOKEN_USER,
    type CreateProject,
    DEFAULT_PROJECT,
    type FeatureToggle,
    type IAccountStore,
    type IEnvironmentStore,
    type IEventStore,
    type IFeatureEnvironmentStore,
    type IFeatureNaming,
    type IFeatureToggleStore,
    type IFlagResolver,
    type IProject,
    type IProjectApplications,
    type IProjectHealth,
    type IProjectOverview,
    type IProjectOwnersReadModel,
    type IProjectRoleUsage,
    type IProjectStore,
    type IProjectUpdate,
    type IUnleashConfig,
    type IUnleashStores,
    MOVE_FEATURE_TOGGLE,
    ProjectAccessAddedEvent,
    ProjectAccessGroupRolesUpdated,
    ProjectAccessUserRolesDeleted,
    ProjectAccessUserRolesUpdated,
    ProjectArchivedEvent,
    type ProjectCreated,
    ProjectCreatedEvent,
    ProjectDeletedEvent,
    ProjectGroupAddedEvent,
    ProjectRevivedEvent,
    ProjectUpdatedEvent,
    ProjectUserRemovedEvent,
    ProjectUserUpdateRoleEvent,
    RoleName,
    SYSTEM_USER_ID,
    type IProjectReadModel,
    type IOnboardingReadModel,
} from '../../types/index.js';
import type {
    IRoleDescriptor,
    IRoleWithProject,
} from '../../types/stores/access-store.js';
import type { FeatureToggleService } from '../feature-toggle/feature-toggle-service.js';
import IncompatibleProjectError from '../../error/incompatible-project-error.js';
import { arraysHaveSameItems } from '../../util/index.js';
import type { GroupService } from '../../services/group-service.js';
import type { FavoritesService } from '../../services/favorites-service.js';
import { calculateAverageTimeToProd } from '../feature-toggle/time-to-production/time-to-production.js';
import type { IProjectStatsStore } from '../../types/stores/project-stats-store-type.js';
import { uniqueByKey } from '../../util/unique.js';
import { BadDataError, PermissionError } from '../../error/index.js';
import type { ProjectDoraMetricsSchema } from '../../openapi/index.js';
import { checkFeatureNamingData } from '../feature-naming-pattern/feature-naming-validation.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import type EventService from '../events/event-service.js';
import type {
    IProjectApplicationsSearchParams,
    IProjectEnterpriseSettingsUpdate,
    IProjectQuery,
    IProjectsQuery,
} from './project-store-type.js';
import type { IProjectFlagCreatorsReadModel } from './project-flag-creators-read-model.type.js';
import { throwExceedsLimitError } from '../../error/exceeds-limit-error.js';
import type EventEmitter from 'events';
import type { ApiTokenService } from '../../services/index.js';
import type { ProjectForUi } from './project-read-model-type.js';
import { canGrantProjectRole } from './can-grant-project-role.js';
import { batchExecute } from '../../util/index.js';
import metricsHelper from '../../util/metrics-helper.js';
import { FUNCTION_TIME } from '../../metric-events.js';
import type { ResourceLimitsService } from '../resource-limits/resource-limits-service.js';

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

export default class ProjectService {
    private projectStore: IProjectStore;

    private projectOwnersReadModel: IProjectOwnersReadModel;

    private projectFlagCreatorsReadModel: IProjectFlagCreatorsReadModel;

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

    private apiTokenService: ApiTokenService;

    private favoritesService: FavoritesService;

    private eventService: EventService;

    private projectStatsStore: IProjectStatsStore;

    private flagResolver: IFlagResolver;

    private isEnterprise: boolean;

    private resourceLimitsService: ResourceLimitsService;

    private eventBus: EventEmitter;

    private projectReadModel: IProjectReadModel;

    private onboardingReadModel: IOnboardingReadModel;

    private timer: Function;

    constructor(
        {
            projectStore,
            projectOwnersReadModel,
            projectFlagCreatorsReadModel,
            eventStore,
            featureToggleStore,
            environmentStore,
            featureEnvironmentStore,
            accountStore,
            projectStatsStore,
            projectReadModel,
            onboardingReadModel,
        }: Pick<
            IUnleashStores,
            | 'projectStore'
            | 'projectOwnersReadModel'
            | 'projectFlagCreatorsReadModel'
            | 'eventStore'
            | 'featureToggleStore'
            | 'environmentStore'
            | 'featureEnvironmentStore'
            | 'accountStore'
            | 'projectStatsStore'
            | 'projectReadModel'
            | 'onboardingReadModel'
        >,
        config: IUnleashConfig,
        accessService: AccessService,
        featureToggleService: FeatureToggleService,
        groupService: GroupService,
        favoriteService: FavoritesService,
        eventService: EventService,
        privateProjectChecker: IPrivateProjectChecker,
        apiTokenService: ApiTokenService,
        resourceLimitsService: ResourceLimitsService,
    ) {
        this.projectStore = projectStore;
        this.projectOwnersReadModel = projectOwnersReadModel;
        this.projectFlagCreatorsReadModel = projectFlagCreatorsReadModel;
        this.environmentStore = environmentStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.accessService = accessService;
        this.eventStore = eventStore;
        this.featureToggleStore = featureToggleStore;
        this.apiTokenService = apiTokenService;
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
        this.resourceLimitsService = resourceLimitsService;
        this.eventBus = config.eventBus;
        this.projectReadModel = projectReadModel;
        this.onboardingReadModel = onboardingReadModel;
        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(config.eventBus, FUNCTION_TIME, {
                className: 'ProjectService',
                functionName,
            });
    }

    async getProjects(
        query?: IProjectQuery & IProjectsQuery,
        userId?: number,
    ): Promise<ProjectForUi[]> {
        const projects = this.flagResolver.isEnabled('projectJoinedQueries')
            ? await this.projectReadModel.getProjectsForAdminUiWithJoinedQuery(
                  query,
                  userId,
              )
            : await this.projectReadModel.getProjectsForAdminUi(query, userId);

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

    async addOwnersToProjects(
        projects: ProjectForUi[],
    ): Promise<ProjectForUi[]> {
        return this.projectOwnersReadModel.addOwners(projects);
    }

    async getProject(id: string): Promise<IProject> {
        const project = await this.projectStore.get(id);
        if (project === undefined) {
            throw new NotFoundError(`Could not find project with id ${id}`);
        }
        return Promise.resolve(project);
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

    private async validateEnvironmentsExist(environments: string[]) {
        const projectsAndExistence = await Promise.all(
            environments.map(async (env) => [
                env,
                await this.environmentStore.exists(env),
            ]),
        );

        const invalidEnvs = projectsAndExistence
            .filter(([_, exists]) => !exists)
            .map(([env]) => env);

        if (invalidEnvs.length > 0) {
            throw new BadDataError(
                `These environments do not exist: ${invalidEnvs
                    .map((env) => `'${env}'`)
                    .join(', ')}.`,
            );
        }
    }

    async validateProjectEnvironments(environments: string[] | undefined) {
        if (environments) {
            await this.validateEnvironmentsExist(environments);
        }
    }

    async validateProjectLimit() {
        const { projects } =
            await this.resourceLimitsService.getResourceLimits();
        const limit = Math.max(projects, 1);
        const projectCount = await this.projectStore.count();

        if (projectCount >= limit) {
            throwExceedsLimitError(this.eventBus, {
                resource: 'project',
                limit,
            });
        }
    }

    async generateProjectId(name: string): Promise<string> {
        const slug = createSlug(name).slice(0, 90);
        const generateUniqueId = async (suffix?: number) => {
            const id = suffix ? `${slug}-${suffix}` : slug;
            if (await this.projectStore.hasProject(id)) {
                return await generateUniqueId((suffix ?? 0) + 1);
            } else {
                return id;
            }
        };
        return generateUniqueId();
    }

    async getAllChangeRequestEnvironments(
        newProject: CreateProject,
    ): Promise<CreateProject['changeRequestEnvironments']> {
        const predefinedChangeRequestEnvironments =
            await this.environmentStore.getChangeRequestEnvironments(
                newProject.environments || [],
            );
        const userSelectedChangeRequestEnvironments =
            newProject.changeRequestEnvironments || [];
        const allChangeRequestEnvironments = [
            ...userSelectedChangeRequestEnvironments.filter(
                (userEnv) =>
                    !predefinedChangeRequestEnvironments.find(
                        (predefinedEnv) => predefinedEnv.name === userEnv.name,
                    ),
            ),
            ...predefinedChangeRequestEnvironments,
        ];
        return allChangeRequestEnvironments;
    }

    async createProject(
        newProject: CreateProject,
        user: IUser,
        auditUser: IAuditUser,
        enableChangeRequestsForSpecifiedEnvironments: (
            environments: CreateProject['changeRequestEnvironments'],
        ) => Promise<
            ProjectCreated['changeRequestEnvironments']
        > = async () => {
            return [];
        },
    ): Promise<ProjectCreated> {
        await this.validateProjectLimit();

        const validateData = async () => {
            await this.validateProjectEnvironments(newProject.environments);

            if (!newProject.id?.trim()) {
                newProject.id = await this.generateProjectId(newProject.name);
                return await projectSchema.validateAsync(newProject);
            } else {
                const validatedData =
                    await projectSchema.validateAsync(newProject);
                await this.validateUniqueId(validatedData.id);
                return validatedData;
            }
        };

        const validatedData = await validateData();
        const data = this.removePropertiesForNonEnterprise(validatedData);

        await this.projectStore.create(data);

        const envsToEnable = newProject.environments
            ? newProject.environments
            : (
                  await this.environmentStore.getAll({
                      enabled: true,
                  })
              ).map((env) => env.name);

        await Promise.all(
            envsToEnable.map(async (env) => {
                await this.featureEnvironmentStore.connectProject(env, data.id);
            }),
        );

        if (this.isEnterprise) {
            if (newProject.changeRequestEnvironments) {
                await this.validateEnvironmentsExist(
                    newProject.changeRequestEnvironments.map((env) => env.name),
                );
                const allChangeRequestEnvironments =
                    await this.getAllChangeRequestEnvironments(newProject);
                const changeRequestEnvironments =
                    await enableChangeRequestsForSpecifiedEnvironments(
                        allChangeRequestEnvironments,
                    );

                data.changeRequestEnvironments = changeRequestEnvironments;
            } else {
                data.changeRequestEnvironments = [];
            }
        }

        await this.accessService.createDefaultProjectRoles(user, data.id);

        await this.eventService.storeEvent(
            new ProjectCreatedEvent({
                data,
                project: data.id,
                auditUser,
            }),
        );

        return { ...data, environments: envsToEnable };
    }

    async updateProject(
        updatedProject: IProjectUpdate,
        auditUser: IAuditUser,
    ): Promise<void> {
        const preData = await this.projectStore.get(updatedProject.id);

        await this.projectStore.update(updatedProject);

        // updated project contains instructions to update the project but it may not represent a whole project
        const afterData = await this.projectStore.get(updatedProject.id);

        await this.eventService.storeEvent(
            new ProjectUpdatedEvent({
                project: updatedProject.id,
                data: afterData,
                preData,
                auditUser,
            }),
        );
    }

    async updateProjectEnterpriseSettings(
        updatedProject: IProjectEnterpriseSettingsUpdate,
        auditUser: IAuditUser,
    ): Promise<void> {
        const preData = await this.projectStore.get(updatedProject.id);

        if (updatedProject.featureNaming) {
            this.validateAndProcessFeatureNamingPattern(
                updatedProject.featureNaming,
            );
        }

        await this.projectStore.updateProjectEnterpriseSettings(updatedProject);

        await this.eventService.storeEvent(
            new ProjectUpdatedEvent({
                project: updatedProject.id,
                data: { ...preData, ...updatedProject },
                preData,
                auditUser,
            }),
        );
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

    private async validateActiveProject(projectId: string) {
        const hasActiveProject =
            await this.projectStore.hasActiveProject(projectId);
        if (!hasActiveProject) {
            throw new NotFoundError(
                `Active project with id ${projectId} does not exist`,
            );
        }
    }

    async changeProject(
        newProjectId: string,
        featureName: string,
        user: IUser,
        currentProjectId: string,
        auditUser: IAuditUser,
    ): Promise<any> {
        const feature = await this.featureToggleStore.get(featureName);
        if (feature === undefined) {
            throw new NotFoundError(`Could not find feature ${featureName}`);
        }
        if (feature.project !== currentProjectId) {
            throw new PermissionError(MOVE_FEATURE_TOGGLE);
        }

        await this.validateActiveProject(newProjectId);

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
            auditUser,
        );
        await this.featureToggleService.updateFeatureStrategyProject(
            featureName,
            newProjectId,
        );

        return updatedFeature;
    }

    async deleteProject(
        id: string,
        user: IUser,
        auditUser: IAuditUser,
    ): Promise<void> {
        if (id === DEFAULT_PROJECT) {
            throw new InvalidOperationError(
                'You can not delete the default project!',
            );
        }

        const flags = await this.featureToggleStore.getAll({
            project: id,
            archived: false,
        });

        if (flags.length > 0) {
            throw new InvalidOperationError(
                'You can not delete a project with active feature flags',
            );
        }

        const archivedFlags = await this.featureToggleStore.getAll({
            project: id,
            archived: true,
        });

        await this.featureToggleService.deleteFeatures(
            archivedFlags.map((flag) => flag.name),
            id,
            auditUser,
        );

        const allTokens = await this.apiTokenService.getAllTokens();
        const projectTokens = allTokens.filter(
            (token) =>
                (token.projects &&
                    token.projects.length === 1 &&
                    token.projects[0] === id) ||
                token.project === id,
        );

        await this.projectStore.delete(id);

        await Promise.all(
            projectTokens.map((token) =>
                this.apiTokenService.delete(token.secret, auditUser),
            ),
        );

        await this.eventService.storeEvent(
            new ProjectDeletedEvent({
                project: id,
                auditUser,
            }),
        );

        await this.accessService.removeDefaultProjectRoles(user, id);
    }

    async archiveProject(id: string, auditUser: IAuditUser): Promise<void> {
        const flags = await this.featureToggleStore.getAll({
            project: id,
            archived: false,
        });

        // TODO: allow archiving project with unused flags

        if (flags.length > 0) {
            throw new InvalidOperationError(
                'You can not archive a project with active feature flags',
            );
        }

        await this.projectStore.archive(id);

        await this.eventService.storeEvent(
            new ProjectArchivedEvent({
                project: id,
                auditUser,
            }),
        );
    }

    async reviveProject(id: string, auditUser: IAuditUser): Promise<void> {
        await this.validateProjectLimit();

        await this.projectStore.revive(id);

        await this.eventService.storeEvent(
            new ProjectRevivedEvent({
                project: id,
                auditUser,
            }),
        );
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
     * @deprecated use removeUserAccess
     */
    async removeUser(
        projectId: string,
        roleId: number,
        userId: number,
        auditUser: IAuditUser,
    ): Promise<void> {
        const role = await this.findProjectRole(projectId, roleId);

        await this.accessService.removeUserFromRole(userId, role.id, projectId);

        const user = await this.accountStore.get(userId);

        await this.eventService.storeEvent(
            new ProjectUserRemovedEvent({
                project: projectId,
                auditUser,
                preData: {
                    roleId,
                    userId,
                    roleName: role.name,
                    email: user?.email,
                },
            }),
        );
    }

    async removeUserAccess(
        projectId: string,
        userId: number,
        auditUser: IAuditUser,
    ): Promise<void> {
        const existingRoles = await this.accessService.getProjectRolesForUser(
            projectId,
            userId,
        );

        await this.accessService.removeUserAccess(projectId, userId);

        await this.eventService.storeEvent(
            new ProjectAccessUserRolesDeleted({
                project: projectId,
                auditUser,
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
        auditUser: IAuditUser,
    ): Promise<void> {
        const existingRoles = await this.accessService.getProjectRolesForGroup(
            projectId,
            groupId,
        );

        await this.accessService.removeGroupAccess(projectId, groupId);

        await this.eventService.storeEvent(
            new ProjectAccessUserRolesDeleted({
                project: projectId,
                auditUser,
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
        auditUser: IAuditUser,
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
            auditUser.username,
            project.id,
        );

        await this.eventService.storeEvent(
            new ProjectGroupAddedEvent({
                project: project.id,
                auditUser,
                data: {
                    groupId: group.id,
                    projectId: project.id,
                    roleName: role.name,
                },
            }),
        );
    }

    private isAdmin(userId: number, roles: IRoleWithProject[]): boolean {
        return (
            userId === SYSTEM_USER_ID ||
            userId === ADMIN_TOKEN_USER.id ||
            roles.some((r) => r.name === RoleName.ADMIN)
        );
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
        userAddingAccess: IAuditUser,
        projectId: string,
        rolesBeingAdded: number[],
    ): Promise<boolean> {
        const userPermissions =
            await this.accessService.getPermissionsForUser(userAddingAccess);
        if (userPermissions.some(({ permission }) => permission === ADMIN)) {
            return true;
        }
        const userRoles = await this.accessService.getAllProjectRolesForUser(
            userAddingAccess.id,
            projectId,
        );

        if (
            this.isAdmin(userAddingAccess.id, userRoles) ||
            this.isProjectOwner(userRoles, projectId)
        ) {
            return true;
        }

        // Users may have access to multiple projects, so we need to filter out the permissions based on this project.
        // Since the project roles are just collections of permissions that are not tied to a project in the database
        // not filtering here might lead to false positives as they may have the permission in another project.
        if (this.flagResolver.isEnabled('projectRoleAssignment')) {
            const filteredUserPermissions = userPermissions.filter(
                (permission) => permission.project === projectId,
            );

            const rolesToBeAssignedData = await Promise.all(
                rolesBeingAdded.map((role) => this.accessService.getRole(role)),
            );
            const rolesToBeAssignedPermissions = rolesToBeAssignedData.flatMap(
                (role) => role.permissions,
            );

            return canGrantProjectRole(
                filteredUserPermissions,
                rolesToBeAssignedPermissions,
            );
        } else {
            return rolesBeingAdded.every((roleId) =>
                userRoles.some((userRole) => userRole.id === roleId),
            );
        }
    }

    async addAccess(
        projectId: string,
        roles: number[],
        groups: number[],
        users: number[],
        auditUser: IAuditUser,
    ): Promise<void> {
        if (await this.isAllowedToAddAccess(auditUser, projectId, roles)) {
            await this.accessService.addAccessToProject(
                roles,
                groups,
                users,
                projectId,
                auditUser.username,
            );

            await this.eventService.storeEvent(
                new ProjectAccessAddedEvent({
                    project: projectId,
                    auditUser,
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
        auditUser: IAuditUser,
    ): Promise<void> {
        const currentRoles = await this.accessService.getProjectRolesForUser(
            projectId,
            userId,
        );
        const isAllowedToAssignRoles = await this.isAllowedToAddAccess(
            auditUser,
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
                    auditUser,
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
        auditUser: IAuditUser,
    ): Promise<void> {
        const currentRoles = await this.accessService.getProjectRolesForGroup(
            projectId,
            groupId,
        );

        const isAllowedToAssignRoles = await this.isAllowedToAddAccess(
            auditUser,
            projectId,
            newRoles,
        );
        if (isAllowedToAssignRoles) {
            await this.accessService.setProjectRolesForGroup(
                projectId,
                groupId,
                newRoles,
                auditUser.username,
            );
            await this.eventService.storeEvent(
                new ProjectAccessGroupRolesUpdated({
                    project: projectId,
                    auditUser,
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

    /** @deprecated use projectInsightsService instead */
    async getDoraMetrics(projectId: string): Promise<ProjectDoraMetricsSchema> {
        const activeFeatureFlags = (
            await this.featureToggleStore.getAll({ project: projectId })
        ).map((feature) => feature.name);

        const archivedFeatureFlags = (
            await this.featureToggleStore.getAll({
                project: projectId,
                archived: true,
            })
        ).map((feature) => feature.name);

        const featureFlagNames = [
            ...activeFeatureFlags,
            ...archivedFeatureFlags,
        ];

        const projectAverage = calculateAverageTimeToProd(
            await this.projectStatsStore.getTimeToProdDates(projectId),
        );

        const flagAverage =
            await this.projectStatsStore.getTimeToProdDatesForFeatureToggles(
                projectId,
                featureFlagNames,
            );

        return {
            features: flagAverage,
            projectAverage: projectAverage,
        };
    }

    async getApplications(
        searchParams: IProjectApplicationsSearchParams,
    ): Promise<IProjectApplications> {
        const applications = await this.projectStore.getApplicationsByProject({
            ...searchParams,
            sortBy: searchParams.sortBy || 'appName',
        });
        return applications;
    }

    async getProjectFlagCreators(projectId: string) {
        return this.projectFlagCreatorsReadModel.getFlagCreators(projectId);
    }

    async changeRole(
        projectId: string,
        roleId: number,
        userId: number,
        auditUser: IAuditUser,
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

        await this.accessService.updateUserProjectRole(
            userId,
            roleId,
            projectId,
        );
        const role = await this.findProjectRole(projectId, roleId);

        await this.eventService.storeEvent(
            new ProjectUserUpdateRoleEvent({
                project: projectId,
                auditUser,
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
        return this.projectReadModel.getProjectsByUser(userId);
    }

    async getProjectRoleUsage(roleId: number): Promise<IProjectRoleUsage[]> {
        return this.accessService.getProjectRoleUsage(roleId);
    }

    async statusJob(): Promise<void> {
        const projects = await this.projectStore.getAll();

        // run one project status update at a time every
        void batchExecute(projects, 1, 30_000, async (project) => {
            const statusUpdate = await this.getStatusUpdates(project.id);
            await this.projectStatsStore.updateProjectStats(
                statusUpdate.projectId,
                statusUpdate.updates,
            );
        });
    }

    async getStatusUpdates(projectId: string): Promise<ICalculateStatus> {
        const stopTimer = this.timer('getStatusUpdates');
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

        stopTimer();
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
        if (project === undefined) {
            throw new NotFoundError(
                `Could not find project with id ${projectId}`,
            );
        }
        return {
            stats: projectStats,
            name: project.name,
            description: project.description!,
            mode: project.mode,
            featureLimit: project.featureLimit,
            featureNaming: project.featureNaming,
            defaultStickiness: project.defaultStickiness,
            health: project.health || 0,
            technicalDebt: 100 - (project.health || 0),
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
            onboardingStatus,
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
            this.onboardingReadModel.getOnboardingStatusForProject(projectId),
        ]);

        if (project === undefined) {
            throw new NotFoundError(
                `Could not find project with id: ${projectId}`,
            );
        }

        return {
            stats: projectStats,
            name: project.name,
            description: project.description!,
            mode: project.mode,
            featureLimit: project.featureLimit,
            featureNaming: project.featureNaming,
            linkTemplates: project.linkTemplates,
            defaultStickiness: project.defaultStickiness,
            health: project.health || 0,
            technicalDebt: 100 - (project.health || 0),
            favorite: favorite,
            updatedAt: project.updatedAt,
            archivedAt: project.archivedAt,
            createdAt: project.createdAt,
            onboardingStatus: onboardingStatus ?? {
                status: 'onboarding-started',
            },
            environments,
            featureTypeCounts,
            members,
            version: 1,
        };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    removePropertiesForNonEnterprise(data): any {
        if (this.isEnterprise) {
            return data;
        }
        const { mode, changeRequestEnvironments, ...proData } = data;
        return proData;
    }
}
