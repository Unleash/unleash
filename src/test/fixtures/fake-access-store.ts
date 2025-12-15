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

export type FakeAccessStoreConfig = Partial<{
    availablePermissions: IPermission[];
}>;

export class FakeAccessStore implements IAccessStore {
    fakeRolesStore: IRoleStore;

    userToRoleMap: Map<number, number> = new Map();

    rolePermissions: Map<number, IPermission[]> = new Map();

    availablePermissions: IPermission[] = [];

    constructor(roleStore?: IRoleStore, config?: FakeAccessStoreConfig) {
        this.fakeRolesStore = roleStore ?? new FakeRoleStore();
        this.availablePermissions = config?.availablePermissions ?? [];
    }

    getProjectUserAndGroupCountsForRole(
        _roleId: number,
    ): Promise<IProjectRoleUsage[]> {
        throw new Error('Method not implemented.');
    }

    getAllProjectRolesForUser(
        _userId: number,
        _project: string,
    ): Promise<IRoleWithProject[]> {
        throw new Error('Method not implemented.');
    }

    addAccessToProject(
        _roles: number[],
        _groups: number[],
        _users: number[],
        _projectId: string,
        _createdBy: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    addGroupToRole(
        _groupId: number,
        _roleId: number,
        _created_by: string,
        _projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    updateUserProjectRole(
        _userId: number,
        _roleId: number,
        _projectId: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeUserFromRole(
        _userId: number,
        _roleId: number,
        _projectId: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    wipePermissionsFromRole(_role_id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    unlinkUserRoles(_userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRoleByName(_name: string): Promise<IRole> {
        throw new Error('Method not implemented.');
    }

    getProjectUsersForRole(
        _roleId: number,
        _projectId?: string,
    ): Promise<IUserRole[]> {
        throw new Error('Method not implemented.');
    }

    getProjectUsers(_projectId?: string): Promise<IUserWithProjectRoles[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRoles(): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    addEnvironmentPermissionsToRole(
        _role_id: number,
        _permissions: PermissionRef[],
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    getAvailablePermissions(): Promise<IPermission[]> {
        return Promise.resolve(this.availablePermissions);
    }

    getPermissionsForUser(_userId: Number): Promise<IUserPermission[]> {
        return Promise.resolve([]);
    }

    getPermissionsForRole(roleId: number): Promise<IPermission[]> {
        const found = this.rolePermissions.get(roleId) ?? [];
        return Promise.resolve(found);
    }

    getRoles(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    getRoleWithId(_id: number): Promise<IRole> {
        throw new Error('Method not implemented.');
    }

    getRolesForProject(_projectId: string): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    removeRolesForProject(_projectId: string): Promise<void> {
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

    getUserIdsForRole(_roleId: number, _projectId: string): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    getGroupIdsForRole(
        _roleId: number,
        _projectId?: string,
    ): Promise<number[]> {
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
        _roleId: number,
        _permission: string,
        _projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRootRoleForAllUsers(): Promise<IUserRole[]> {
        throw new Error('Method not implemented.');
    }

    delete(_key: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    exists(_key: number): Promise<boolean> {
        return Promise.resolve(false);
    }

    get(_key: number): Promise<IRole> {
        throw new Error('Not implemented yet');
    }

    getAll(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    getRootRoles(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    removeRolesOfTypeForUser(
        _userId: number,
        _roleTypes: string[],
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    cloneEnvironmentPermissions(
        _sourceEnvironment: string,
        _destinationEnvironment: string,
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    clearUserPersonalAccessTokens(_userId: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    unlinkUserGroups(_userId: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    clearPublicSignupUserTokens(_userId: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    getProjectRolesForGroup(
        _projectId: string,
        _groupId: number,
    ): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRolesForUser(
        _projectId: string,
        _userId: number,
    ): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    setProjectRolesForGroup(
        _projectId: string,
        _groupId: number,
        _roles: number[],
        _createdBy: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setProjectRolesForUser(
        _projectId: string,
        _userId: number,
        _roles: number[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeUserAccess(_projectId: string, _userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeGroupAccess(_projectId: string, _groupId: number): Promise<void> {
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
