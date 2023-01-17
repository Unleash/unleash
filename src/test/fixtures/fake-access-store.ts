/* eslint-disable @typescript-eslint/no-unused-vars */
import noLoggerProvider from './no-logger';
import {
    IAccessInfo,
    IAccessStore,
    IRole,
    IRoleWithProject,
    IAccountRole,
    IAccountPermission,
} from '../../lib/types/stores/access-store';
import { IPermission } from 'lib/types/model';

class AccessStoreMock implements IAccessStore {
    isChangeRequestsEnabled(
        project: string,
        environment: string,
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    addAccessToProject(
        accounts: IAccessInfo[],
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

    updateAccountProjectRole(
        accountId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeAccountFromRole(
        accountId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    wipePermissionsFromRole(role_id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    unlinkAccountRoles(accountId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRoleByName(name: string): Promise<IRole> {
        throw new Error('Method not implemented.');
    }

    getProjectAccountsForRole(
        roleId: number,
        projectId?: string,
    ): Promise<IAccountRole[]> {
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

    accountPermissions: IAccountPermission[] = [];

    roles: IRole[] = [];

    getAvailablePermissions(): Promise<IPermission[]> {
        throw new Error('Method not implemented.');
    }

    getPermissionsForAccount(accountId: Number): Promise<IAccountPermission[]> {
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

    getRolesForAccountId(accountId: number): Promise<IRoleWithProject[]> {
        return Promise.resolve([]);
    }

    getAccountIdsForRole(roleId: number, projectId: string): Promise<number[]> {
        throw new Error('Method not implemented.');
    }

    addAccountToRole(accountId: number, roleId: number): Promise<void> {
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

    getRootRoleForAllAccounts(): Promise<IAccountRole[]> {
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

    removeRolesOfTypeForAccount(
        accountId: number,
        roleType: string,
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    cloneEnvironmentPermissions(
        sourceEnvironment: string,
        destinationEnvironment: string,
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    clearAccountPersonalAccessTokens(accountId: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    unlinkAccountGroups(accountId: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    clearPublicSignupAccountTokens(accountId: number): Promise<void> {
        return Promise.resolve(undefined);
    }
}

module.exports = AccessStoreMock;

export default AccessStoreMock;
