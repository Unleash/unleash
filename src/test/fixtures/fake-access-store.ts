/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    IAccessStore,
    IProjectRoleUsage,
    IRole,
    IRoleWithProject,
    IUserPermission,
    IUserRole,
    IUserWithProjectRoles,
} from '../../lib/types/stores/access-store.js';
import type { IPermission } from '../../lib/types/model.js';
import {
    type IRoleStore,
    type IUserAccessOverview,
    RoleName,
    RoleType,
} from '../../lib/types/index.js';
import FakeRoleStore from './fake-role-store.js';
import type { PermissionRef } from '../../lib/services/access-service.js';

export class FakeAccessStore implements IAccessStore {
    fakeRolesStore: IRoleStore;

    userToRoleMap: Map<number, number> = new Map();

    rolePermissions: Map<number, IPermission[]> = new Map();

    constructor(roleStore?: IRoleStore) {
        this.fakeRolesStore = roleStore ?? new FakeRoleStore();
    }

    getProjectUserAndGroupCountsForRole(
        roleId: number,
    ): Promise<IProjectRoleUsage[]> {
        throw new Error('Method not implemented.');
    }

    getAllProjectRolesForUser(
        userId: number,
        project: string,
    ): Promise<IRoleWithProject[]> {
        throw new Error('Method not implemented.');
    }

    addAccessToProject(
        roles: number[],
        groups: number[],
        users: number[],
        projectId: string,
        createdBy: string,
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

    getProjectUsers(projectId?: string): Promise<IUserWithProjectRoles[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRoles(): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    addEnvironmentPermissionsToRole(
        role_id: number,
        permissions: PermissionRef[],
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    getAvailablePermissions(): Promise<IPermission[]> {
        return Promise.resolve([]);
    }

    getPermissionsForUser(userId: Number): Promise<IUserPermission[]> {
        return Promise.resolve([]);
    }

    getPermissionsForRole(roleId: number): Promise<IPermission[]> {
        const found = this.rolePermissions.get(roleId) ?? [];
        return Promise.resolve(found);
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

    async getRolesForUserId(userId: number): Promise<IRoleWithProject[]> {
        const roleId = this.userToRoleMap.get(userId);
        const found =
            roleId === undefined
                ? undefined
                : await this.fakeRolesStore.get(roleId);
        if (found) {
            return Promise.resolve([found as IRoleWithProject]);
        } else {
            return Promise.resolve([]);
        }
    }

    getUserIdsForRole(roleId: number, projectId: string): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    getGroupIdsForRole(roleId: number, projectId?: string): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    addUserToRole(userId: number, roleId: number): Promise<void> {
        this.userToRoleMap.set(userId, roleId);
        return Promise.resolve(undefined);
    }

    addPermissionsToRole(
        role_id: number,
        permissions: PermissionRef[],
        environment?: string,
    ): Promise<void> {
        this.rolePermissions.set(
            role_id,
            (environment
                ? permissions.map((p) => ({ ...p, environment }))
                : permissions) as IPermission[],
        );
        return Promise.resolve(undefined);
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
        throw new Error('Not implemented yet');
    }

    getAll(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    getRootRoles(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    removeRolesOfTypeForUser(
        userId: number,
        roleTypes: string[],
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    cloneEnvironmentPermissions(
        sourceEnvironment: string,
        destinationEnvironment: string,
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    clearUserPersonalAccessTokens(userId: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    unlinkUserGroups(userId: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    clearPublicSignupUserTokens(userId: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    getProjectRolesForGroup(
        projectId: string,
        groupId: number,
    ): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRolesForUser(
        projectId: string,
        userId: number,
    ): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    setProjectRolesForGroup(
        projectId: string,
        groupId: number,
        roles: number[],
        createdBy: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setProjectRolesForUser(
        projectId: string,
        userId: number,
        roles: number[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeUserAccess(projectId: string, userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeGroupAccess(projectId: string, groupId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getUserAccessOverview(): Promise<IUserAccessOverview[]> {
        throw new Error('Method not implemented.');
    }
    getRootRoleForUser(userId: number): Promise<IRole | undefined> {
        const roleId = this.userToRoleMap.get(userId);
        if (roleId !== undefined) {
            return Promise.resolve(this.fakeRolesStore.get(roleId));
        } else {
            return Promise.resolve({
                id: -1,
                name: RoleName.VIEWER,
                type: RoleType.ROOT,
            });
        }
    }
}

export default FakeAccessStore;
