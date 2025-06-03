import type { PermissionRef } from '../../services/access-service.js';
import type { IGroupModelWithAddedAt } from '../group.js';
import type {
    IPermission,
    IUserAccessOverview,
    IUserWithRole,
} from '../model.js';
import type { Store } from './store.js';

export interface IUserPermission {
    project?: string;
    environment?: string;
    permission: string;
}

export interface IRole {
    id: number;
    name: string;
    description?: string;
    type: string;
}

export interface IProjectRoleUsage {
    project: string;
    role: number;
    userCount: number;
    groupCount: number;
    serviceAccountCount: number;
}

export interface IRoleWithProject extends IRole {
    project: string;
}

export interface IRoleWithPermissions extends IRole {
    permissions: IPermission[];
}

export interface IRoleDescriptor {
    id: number;
    name: string;
    description?: string;
    type: string;
}

export interface IUserRole {
    roleId: number;
    userId: number;
    addedAt?: Date;
}

interface IEntityWithProjectRoles {
    roles?: number[];
}

export interface IUserWithProjectRoles
    extends IUserWithRole,
        IEntityWithProjectRoles {}
export interface IGroupWithProjectRoles
    extends IGroupModelWithAddedAt,
        IEntityWithProjectRoles {}

export interface IAccessStore extends Store<IRole, number> {
    getAvailablePermissions(): Promise<IPermission[]>;

    getPermissionsForUser(userId: number): Promise<IUserPermission[]>;

    getPermissionsForRole(roleId: number): Promise<IPermission[]>;

    unlinkUserRoles(userId: number): Promise<void>;

    unlinkUserGroups(userId: number): Promise<void>;

    clearUserPersonalAccessTokens(userId: number): Promise<void>;

    clearPublicSignupUserTokens(userId: number): Promise<void>;

    getRolesForUserId(userId: number): Promise<IRoleWithProject[]>;

    getProjectUsersForRole(
        roleId: number,
        projectId?: string,
    ): Promise<IUserRole[]>;

    getAllProjectRolesForUser(
        userId: number,
        project: string,
    ): Promise<IRoleWithProject[]>;

    getProjectUsers(projectId?: string): Promise<IUserWithProjectRoles[]>;

    getUserIdsForRole(roleId: number, projectId?: string): Promise<number[]>;

    getGroupIdsForRole(roleId: number, projectId?: string): Promise<number[]>;

    getProjectUserAndGroupCountsForRole(
        roleId: number,
    ): Promise<IProjectRoleUsage[]>;

    wipePermissionsFromRole(role_id: number): Promise<void>;

    addEnvironmentPermissionsToRole(
        role_id: number,
        permissions: PermissionRef[],
    ): Promise<void>;

    addUserToRole(
        userId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void>;

    addAccessToProject(
        roles: number[],
        groups: number[],
        users: number[],
        projectId: string,
        createdBy: string,
    ): Promise<void>;

    removeUserFromRole(
        userId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void>;

    addGroupToRole(
        groupId: number,
        roleId: number,
        created_by: string,
        projectId?: string,
    ): Promise<void>;

    updateUserProjectRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void>;

    removeRolesOfTypeForUser(
        userId: number,
        roleTypes: string[],
    ): Promise<void>;

    addPermissionsToRole(
        role_id: number,
        permissions: PermissionRef[] | string[],
        environment?: string,
    ): Promise<void>;

    removePermissionFromRole(
        roleId: number,
        permission: string,
        environment?: string,
    ): Promise<void>;

    cloneEnvironmentPermissions(
        sourceEnvironment: string,
        destinationEnvironment: string,
    ): Promise<void>;

    setProjectRolesForUser(
        projectId: string,
        userId: number,
        roles: number[],
    ): Promise<void>;
    getProjectRolesForUser(
        projectId: string,
        userId: number,
    ): Promise<number[]>;
    getRootRoleForUser(userId: number): Promise<IRole | undefined>;
    setProjectRolesForGroup(
        projectId: string,
        groupId: number,
        roles: number[],
        createdBy: string,
    ): Promise<void>;
    getProjectRolesForGroup(
        projectId: string,
        groupId: number,
    ): Promise<number[]>;
    removeUserAccess(projectId: string, userId: number): Promise<void>;
    removeGroupAccess(projectId: string, groupId: number): Promise<void>;
    getUserAccessOverview(): Promise<IUserAccessOverview[]>;
}
