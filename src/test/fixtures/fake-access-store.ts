/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    AccessStore,
    IRole,
    IUserRole,
    IUserPermission,
} from '../../lib/db/access-store';
import noLoggerProvider from './no-logger';

class AccessStoreMock extends AccessStore {
    constructor() {
        super(undefined, undefined, noLoggerProvider);
    }

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

    getUserIdsForRole(roleId: number): Promise<IRole[]> {
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
}

module.exports = AccessStoreMock;

export default AccessStoreMock;
