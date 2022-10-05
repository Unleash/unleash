import { IPermission } from '../model';
import { Store } from './store';

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

export interface IProjectAccessModel {
    users: IAccessInfo[];
    groups: IAccessInfo[];
}

export interface IAccessInfo {
    id: number;
}

export interface IUserRole {
    roleId?: number;
    userId: number;
    addedAt?: Date;
}

export interface IAccessStore extends Store<IRole, number> {
    getAvailablePermissions(): Promise<IPermission[]>;

    getPermissionsForUser(userId: number): Promise<IUserPermission[]>;

    getPermissionsForRole(roleId: number): Promise<IPermission[]>;

    unlinkUserRoles(userId: number): Promise<void>;

    getRolesForUserId(userId: number): Promise<IRoleWithProject[]>;

    getProjectUsersForRole(
        roleId: number,
        projectId?: string,
    ): Promise<IUserRole[]>;

    getUserIdsForRole(roleId: number, projectId?: string): Promise<number[]>;

    wipePermissionsFromRole(role_id: number): Promise<void>;

    addEnvironmentPermissionsToRole(
        role_id: number,
        permissions: IPermission[],
    ): Promise<void>;

    addUserToRole(
        userId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void>;

    addAccessToProject(
        users: IAccessInfo[],
        groups: IAccessInfo[],
        projectId: string,
        roleId: number,
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

    removeGroupFromRole(
        groupId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void>;

    updateUserProjectRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void>;

    updateGroupProjectRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void>;

    removeRolesOfTypeForUser(userId: number, roleType: string): Promise<void>;

    addPermissionsToRole(
        role_id: number,
        permissions: string[],
        environment?: string,
    ): Promise<void>;

    removePermissionFromRole(
        roleId: number,
        permission: string,
        environment?: string,
    ): Promise<void>;
}
