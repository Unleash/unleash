import { IAvailablePermissions, IPermission } from '../model';
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

export interface IRoleWithPermissions extends IRole {
    permissions: IPermission[];
}

export interface IRoleDescriptor {
    name: string;
    description?: string;
    type: string;
}

export interface IUserRole {
    roleId: number;
    userId: number;
}
export interface IAccessStore extends Store<IRole, number> {
    getRoleByName(name: string): Promise<IRole>;
    getAvailablePermissions(): Promise<IAvailablePermissions>;
    getPermissionsForUser(userId: number): Promise<IUserPermission[]>;
    getPermissionsForRole(roleId: number): Promise<IPermission[]>;
    getRoles(): Promise<IRole[]>;
    getRolesForProject(projectId: string): Promise<IRole[]>;
    unlinkUserRoles(userId: number): Promise<void>;
    getProjectRoles(): Promise<IRole[]>;
    getRootRoles(): Promise<IRole[]>;
    removeRolesForProject(projectId: string): Promise<void>;
    getRolesForUserId(userId: number): Promise<IRole[]>;
    getProjectUserIdsForRole(roleId: number, projectId?: string);
    getUserIdsForRole(roleId: number, projectId?: string): Promise<number[]>;
    wipePermissionsFromRole(role_id: number): Promise<void>;
    addEnvironmentPermissionsToRole(
        role_id: number,
        permissions: IPermission[],
    ): Promise<void>;
    setupPermissionsForEnvironment(
        environmentName: string,
        permissions: string[],
    ): Promise<void>;
    addUserToRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void>;
    removeUserFromRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void>;
    removeRolesOfTypeForUser(userId: number, roleType: string): Promise<void>;
    createRole(
        name: string,
        type: string,
        project?: string,
        description?: string,
    ): Promise<IRole>;
    addPermissionsToRole(
        role_id: number,
        permissions: string[],
        environment?: string,
    ): Promise<void>;
    removePermissionFromRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void>;
    getRootRoleForAllUsers(): Promise<IUserRole[]>;
}
