/* eslint-disable @typescript-eslint/no-unused-vars */
import noLoggerProvider from './no-logger';
import {
    IAccessInfo,
    IAccessStore,
    IRole,
    IRoleWithProject,
    IUserPermission,
    IUserRole,
} from '../../lib/types/stores/access-store';
import { IPermission } from 'lib/types/model';

class AccessStoreMock implements IAccessStore {
    addAccessToProject(
        users: IAccessInfo[],
        groups: IAccessInfo[],
        projectId: string,
        roleId: number,
        createdBy: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    updateGroupProjectRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    addGroupToRole(
        groupId: number,
        roleId: number,
        created_by: string,
        projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeGroupFromRole(
        groupId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    updateUserProjectRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeUserFromRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    wipePermissionsFromRole(role_id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    unlinkUserRoles(userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRoleByName(name: string): Promise<IRole> {
        throw new Error('Method not implemented.');
    }

    getProjectUsersForRole(
        roleId: number,
        projectId?: string,
    ): Promise<IUserRole[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRoles(): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    addEnvironmentPermissionsToRole(
        role_id: number,
        permissions: IPermission[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    userPermissions: IUserPermission[] = [];

    roles: IRole[] = [];

    getAvailablePermissions(): Promise<IPermission[]> {
        throw new Error('Method not implemented.');
    }

    getPermissionsForUser(userId: Number): Promise<IUserPermission[]> {
        return Promise.resolve([]);
    }

    getPermissionsForRole(roleId: number): Promise<IPermission[]> {
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

    getRolesForUserId(userId: number): Promise<IRoleWithProject[]> {
        return Promise.resolve([]);
    }

    getUserIdsForRole(roleId: number, projectId: string): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    addUserToRole(userId: number, roleId: number): Promise<void> {
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
