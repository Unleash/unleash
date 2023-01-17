import { IPermission } from '../model';
import { Store } from './store';

export interface IAccountPermission {
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
    accounts: IAccessInfo[];
    groups: IAccessInfo[];
}

export interface IAccessInfo {
    id: number;
}

export interface IAccountRole {
    roleId?: number;
    accountId: number;
    addedAt?: Date;
}

export interface IAccessStore extends Store<IRole, number> {
    getAvailablePermissions(): Promise<IPermission[]>;

    getPermissionsForAccount(accountId: number): Promise<IAccountPermission[]>;

    getPermissionsForRole(roleId: number): Promise<IPermission[]>;

    unlinkAccountRoles(accountId: number): Promise<void>;

    unlinkAccountGroups(accountId: number): Promise<void>;

    clearAccountPersonalAccessTokens(accountId: number): Promise<void>;

    clearPublicSignupAccountTokens(accountId: number): Promise<void>;

    getRolesForAccountId(accountId: number): Promise<IRoleWithProject[]>;

    getProjectAccountsForRole(
        roleId: number,
        projectId?: string,
    ): Promise<IAccountRole[]>;

    getAccountIdsForRole(roleId: number, projectId?: string): Promise<number[]>;

    wipePermissionsFromRole(role_id: number): Promise<void>;

    addEnvironmentPermissionsToRole(
        role_id: number,
        permissions: IPermission[],
    ): Promise<void>;

    addAccountToRole(
        accountId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void>;

    addAccessToProject(
        accounts: IAccessInfo[],
        groups: IAccessInfo[],
        projectId: string,
        roleId: number,
        createdBy: string,
    ): Promise<void>;

    removeAccountFromRole(
        accountId: number,
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

    updateAccountProjectRole(
        accountId: number,
        roleId: number,
        projectId: string,
    ): Promise<void>;

    updateGroupProjectRole(
        accountId: number,
        roleId: number,
        projectId: string,
    ): Promise<void>;

    removeRolesOfTypeForAccount(
        accountId: number,
        roleType: string,
    ): Promise<void>;

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

    cloneEnvironmentPermissions(
        sourceEnvironment: string,
        destinationEnvironment: string,
    ): Promise<void>;

    isChangeRequestsEnabled(
        project: string,
        environment: string,
    ): Promise<boolean>;
}
