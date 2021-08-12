import { Store } from './store';

export interface IUserPermission {
    project?: string;
    permission: string;
}

export interface IRole {
    id: number;
    name: string;
    description?: string;
    type: string;
    project?: string;
}

export interface IUserRole {
    roleId: number;
    userId: number;
}
export interface IAccessStore extends Store<IRole, number> {
    getPermissionsForUser(userId: number): Promise<IUserPermission[]>;
    getPermissionsForRole(roleId: number): Promise<IUserPermission[]>;
    getRoles(): Promise<IRole[]>;
    getRolesForProject(projectId: string): Promise<IRole[]>;
    getRootRoles(): Promise<IRole[]>;
    removeRolesForProject(projectId: string): Promise<void>;
    getRolesForUserId(userId: number): Promise<IRole[]>;
    getUserIdsForRole(roleId: number): Promise<number[]>;
    addUserToRole(userId: number, roleId: number): Promise<void>;
    removeUserFromRole(userId: number, roleId: number): Promise<void>;
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
        projectId?: string,
    ): Promise<void>;
    removePermissionFromRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void>;
    getRootRoleForAllUsers(): Promise<IUserRole[]>;
}
