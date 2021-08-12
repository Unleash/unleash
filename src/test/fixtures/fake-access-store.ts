/* eslint-disable @typescript-eslint/no-unused-vars */
import noLoggerProvider from './no-logger';
import {
    IAccessStore,
    IRole,
    IUserPermission,
    IUserRole,
} from '../../lib/types/stores/access-store';

class AccessStoreMock implements IAccessStore {
    userPermissions: IUserPermission[] = [];

    roles: IRole[] = [];

    getPermissionsForUser(userId: Number): Promise<IUserPermission[]> {
        return Promise.resolve([]);
    }

    getPermissionsForRole(roleId: number): Promise<IUserPermission[]> {
        throw new Error('Method not implemented.');
    }

    getRoles(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    getRoleWithId(id: number): Promise<IRole> {
        throw new Error('Method not implemented.');
    }

    getRolesForProject(projectId: string): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    removeRolesForProject(projectId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRolesForUserId(userId: number): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    getUserIdsForRole(roleId: number): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    addUserToRole(userId: number, roleId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeUserFromRole(userId: number, roleId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    createRole(
        name: string,
        type: string,
        project?: string,
        description?: string,
    ): Promise<IRole> {
        throw new Error('Method not implemented.');
    }

    addPermissionsToRole(
        role_id: number,
        permissions: string[],
        projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removePermissionFromRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRootRoleForAllUsers(): Promise<IUserRole[]> {
        throw new Error('Method not implemented.');
    }

    delete(key: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    exists(key: number): Promise<boolean> {
        return Promise.resolve(false);
    }

    get(key: number): Promise<IRole> {
        return Promise.resolve(undefined);
    }

    getAll(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    getRootRoles(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    removeRolesOfTypeForUser(userId: number, roleType: string): Promise<void> {
        return Promise.resolve(undefined);
    }
}

module.exports = AccessStoreMock;

export default AccessStoreMock;
