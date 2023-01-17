import * as permissions from '../types/permissions';
import {
    IAccessInfo,
    IAccessStore,
    IRole,
    IRoleWithPermissions,
    IRoleWithProject,
    IAccountPermission,
    IAccountRole,
} from '../types/stores/access-store';
import { Logger } from '../logger';
import { IAccountStore, IUnleashStores } from '../types/stores';
import {
    IAvailablePermissions,
    ICustomRole,
    IPermission,
    IRoleData,
    RoleName,
    RoleType,
} from '../types/model';
import { IRoleStore } from 'lib/types/stores/role-store';
import NameExistsError from '../error/name-exists-error';
import { IEnvironmentStore } from 'lib/types/stores/environment-store';
import RoleInUseError from '../error/role-in-use-error';
import { roleSchema } from '../schema/role-schema';
import { CUSTOM_ROLE_TYPE, ALL_PROJECTS, ALL_ENVS } from '../util/constants';
import { DEFAULT_PROJECT } from '../types/project';
import InvalidOperationError from '../error/invalid-operation-error';
import BadDataError from '../error/bad-data-error';
import { IGroupModelWithProjectRole } from '../types/group';
import { GroupService } from './group-service';
import { IAccount, IAccountWithRole, IProjectAccount } from 'lib/types';

const { ADMIN } = permissions;

const PROJECT_ADMIN = [
    permissions.UPDATE_PROJECT,
    permissions.DELETE_PROJECT,
    permissions.CREATE_FEATURE,
    permissions.UPDATE_FEATURE,
    permissions.DELETE_FEATURE,
];

interface IRoleCreation {
    name: string;
    description: string;
    permissions?: IPermission[];
}

export interface IRoleValidation {
    name: string;
    description?: string;
    permissions?: Pick<IPermission, 'id' | 'environment'>[];
}

interface IRoleUpdate {
    id: number;
    name: string;
    description: string;
    permissions?: IPermission[];
}

const isProjectPermission = (permission) => PROJECT_ADMIN.includes(permission);

export class AccessService {
    private store: IAccessStore;

    private accountStore: IAccountStore;

    private roleStore: IRoleStore;

    private groupService: GroupService;

    private environmentStore: IEnvironmentStore;

    private logger: Logger;

    constructor(
        {
            accessStore,
            accountStore,
            roleStore,
            environmentStore,
        }: Pick<
            IUnleashStores,
            'accessStore' | 'accountStore' | 'roleStore' | 'environmentStore'
        >,
        { getLogger }: { getLogger: Function },
        groupService: GroupService,
    ) {
        this.store = accessStore;
        this.accountStore = accountStore;
        this.roleStore = roleStore;
        this.groupService = groupService;
        this.environmentStore = environmentStore;
        this.logger = getLogger('/services/access-service.ts');
    }

    /**
     * Used to check if an account has access to the requested resource
     *
     * @param account
     * @param permission
     * @param projectId
     */
    async hasPermission(
        account: IAccount,
        permission: string,
        projectId?: string,
        environment?: string,
    ): Promise<boolean> {
        this.logger.info(
            `Checking permission=${permission}, userId=${account.id}, projectId=${projectId}, environment=${environment}`,
        );

        try {
            const accountP = await this.getPermissionsForAccount(account);

            return accountP
                .filter(
                    (p) =>
                        !p.project ||
                        p.project === projectId ||
                        p.project === ALL_PROJECTS,
                )
                .filter(
                    (p) =>
                        !p.environment ||
                        p.environment === environment ||
                        p.environment === ALL_ENVS,
                )
                .some(
                    (p) =>
                        p.permission === permission || p.permission === ADMIN,
                );
        } catch (e) {
            this.logger.error(
                `Error checking permission=${permission}, userId=${account.id} projectId=${projectId}`,
                e,
            );
            return Promise.resolve(false);
        }
    }

    async getPermissionsForAccount(
        account: IAccount,
    ): Promise<IAccountPermission[]> {
        if (account.isAPI) {
            return account.permissions?.map((p) => ({
                permission: p,
            }));
        }
        return this.store.getPermissionsForAccount(account.id);
    }

    async getPermissions(): Promise<IAvailablePermissions> {
        const bindablePermissions = await this.store.getAvailablePermissions();
        const environments = await this.environmentStore.getAll();

        const projectPermissions = bindablePermissions.filter((x) => {
            return x.type === 'project';
        });

        const environmentPermissions = bindablePermissions.filter((perm) => {
            return perm.type === 'environment';
        });

        const allEnvironmentPermissions = environments.map((env) => {
            return {
                name: env.name,
                permissions: environmentPermissions.map((permission) => {
                    return { environment: env.name, ...permission };
                }),
            };
        });

        return {
            project: projectPermissions,
            environments: allEnvironmentPermissions,
        };
    }

    async addAccountToRole(
        accountId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        return this.store.addAccountToRole(accountId, roleId, projectId);
    }

    async addGroupToRole(
        groupId: number,
        roleId: number,
        createdBy: string,
        projectId: string,
    ): Promise<void> {
        return this.store.addGroupToRole(groupId, roleId, createdBy, projectId);
    }

    async addAccessToProject(
        accounts: IAccessInfo[],
        groups: IAccessInfo[],
        projectId: string,
        roleId: number,
        createdBy: string,
    ): Promise<void> {
        return this.store.addAccessToProject(
            accounts,
            groups,
            projectId,
            roleId,
            createdBy,
        );
    }

    async getRoleByName(roleName: string): Promise<IRole> {
        return this.roleStore.getRoleByName(roleName);
    }

    async setAccountRootRole(
        accountId: number,
        role: number | RoleName,
    ): Promise<void> {
        const newRootRole = await this.resolveRootRole(role);
        if (newRootRole) {
            try {
                await this.store.removeRolesOfTypeForAccount(
                    accountId,
                    RoleType.ROOT,
                );

                await this.store.addAccountToRole(
                    accountId,
                    newRootRole.id,
                    DEFAULT_PROJECT,
                );
            } catch (error) {
                throw new Error(
                    `Could not add role=${newRootRole.name} to userId=${accountId}`,
                );
            }
        } else {
            throw new BadDataError(`Could not find rootRole=${role}`);
        }
    }

    async getAccountRootRoles(accountId: number): Promise<IRoleWithProject[]> {
        const accountRoles = await this.store.getRolesForAccountId(accountId);
        return accountRoles.filter((r) => r.type === RoleType.ROOT);
    }

    async removeAccountFromRole(
        accountId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        return this.store.removeAccountFromRole(accountId, roleId, projectId);
    }

    async removeGroupFromRole(
        groupId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        return this.store.removeGroupFromRole(groupId, roleId, projectId);
    }

    async updateAccountProjectRole(
        accountId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        return this.store.updateAccountProjectRole(
            accountId,
            roleId,
            projectId,
        );
    }

    async updateGroupProjectRole(
        groupId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        return this.store.updateGroupProjectRole(groupId, roleId, projectId);
    }

    //This actually only exists for testing purposes
    async addPermissionToRole(
        roleId: number,
        permission: string,
        environment?: string,
    ): Promise<void> {
        if (isProjectPermission(permission) && !environment) {
            throw new Error(
                `ProjectId cannot be empty for permission=${permission}`,
            );
        }
        return this.store.addPermissionsToRole(
            roleId,
            [permission],
            environment,
        );
    }

    //This actually only exists for testing purposes
    async removePermissionFromRole(
        roleId: number,
        permission: string,
        environment?: string,
    ): Promise<void> {
        if (isProjectPermission(permission) && !environment) {
            throw new Error(
                `ProjectId cannot be empty for permission=${permission}`,
            );
        }
        return this.store.removePermissionFromRole(
            roleId,
            permission,
            environment,
        );
    }

    async getRoles(): Promise<IRole[]> {
        return this.roleStore.getRoles();
    }

    async getRole(id: number): Promise<IRoleWithPermissions> {
        const role = await this.store.get(id);
        const rolePermissions = await this.store.getPermissionsForRole(role.id);
        return {
            ...role,
            permissions: rolePermissions,
        };
    }

    async getRoleData(roleId: number): Promise<IRoleData> {
        const [role, rolePerms, accounts] = await Promise.all([
            this.store.get(roleId),
            this.store.getPermissionsForRole(roleId),
            this.getAccountsForRole(roleId),
        ]);
        return { role, permissions: rolePerms, accounts };
    }

    async getProjectRoles(): Promise<IRole[]> {
        return this.roleStore.getProjectRoles();
    }

    async getRolesForProject(projectId: string): Promise<IRole[]> {
        return this.roleStore.getRolesForProject(projectId);
    }

    async getRolesForAccount(accountId: number): Promise<IRole[]> {
        return this.store.getRolesForAccountId(accountId);
    }

    async wipeAccountPermissions(accountId: number): Promise<void[]> {
        return Promise.all([
            this.store.unlinkAccountRoles(accountId),
            this.store.unlinkAccountGroups(accountId),
            this.store.clearAccountPersonalAccessTokens(accountId),
            this.store.clearPublicSignupAccountTokens(accountId),
        ]);
    }

    async getAccountsForRole(roleId: number): Promise<IAccount[]> {
        const accountIdList = await this.store.getAccountIdsForRole(roleId);
        if (accountIdList.length > 0) {
            return this.accountStore.getAllWithId(accountIdList);
        }
        return [];
    }

    async getProjectAccountsForRole(
        roleId: number,
        projectId?: string,
    ): Promise<IProjectAccount[]> {
        const accountRoleList = await this.store.getProjectAccountsForRole(
            roleId,
            projectId,
        );
        if (accountRoleList.length > 0) {
            const accountIdList = accountRoleList.map(
                ({ accountId }) => accountId,
            );
            const accounts = await this.accountStore.getAllWithId(
                accountIdList,
            );
            return accounts.map((account) => {
                const role = accountRoleList.find(
                    ({ accountId }) => accountId == account.id,
                );
                return {
                    ...account,
                    addedAt: role.addedAt,
                };
            });
        }
        return [];
    }

    async getProjectRoleAccess(
        projectId: string,
    ): Promise<[IRole[], IAccountWithRole[], IGroupModelWithProjectRole[]]> {
        const roles = await this.roleStore.getProjectRoles();

        const accounts = await Promise.all(
            roles.map(async (role) => {
                const projectAccounts = await this.getProjectAccountsForRole(
                    role.id,
                    projectId,
                );
                return projectAccounts.map((u) => ({ ...u, roleId: role.id }));
            }),
        );
        const groups = await this.groupService.getProjectGroups(projectId);
        return [roles, accounts.flat(), groups];
    }

    async createDefaultProjectRoles(
        owner: IAccount,
        projectId: string,
    ): Promise<void> {
        if (!projectId) {
            throw new Error('ProjectId cannot be empty');
        }

        const ownerRole = await this.roleStore.getRoleByName(RoleName.OWNER);

        // TODO: remove this when all users is guaranteed to have a unique id.
        if (owner.id) {
            this.logger.info(
                `Making ${owner.id} admin of ${projectId} via roleId=${ownerRole.id}`,
            );
            await this.store.addAccountToRole(
                owner.id,
                ownerRole.id,
                projectId,
            );
        }
    }

    async removeDefaultProjectRoles(
        owner: IAccount,
        projectId: string,
    ): Promise<void> {
        this.logger.info(`Removing project roles for ${projectId}`);
        return this.roleStore.removeRolesForProject(projectId);
    }

    async getRootRoleForAllAccounts(): Promise<IAccountRole[]> {
        return this.roleStore.getRootRoleForAllAccounts();
    }

    async getRootRoles(): Promise<IRole[]> {
        return this.roleStore.getRootRoles();
    }

    public async resolveRootRole(rootRole: number | RoleName): Promise<IRole> {
        const rootRoles = await this.getRootRoles();
        let role: IRole;
        if (typeof rootRole === 'number') {
            role = rootRoles.find((r) => r.id === rootRole);
        } else {
            role = rootRoles.find((r) => r.name === rootRole);
        }
        return role;
    }

    async getRootRole(roleName: RoleName): Promise<IRole> {
        const roles = await this.roleStore.getRootRoles();
        return roles.find((r) => r.name === roleName);
    }

    async getAllRoles(): Promise<ICustomRole[]> {
        return this.roleStore.getAll();
    }

    async createRole(role: IRoleCreation): Promise<ICustomRole> {
        const baseRole = {
            ...(await this.validateRole(role)),
            roleType: CUSTOM_ROLE_TYPE,
        };

        const rolePermissions = role.permissions;
        const newRole = await this.roleStore.create(baseRole);
        if (rolePermissions) {
            await this.store.addEnvironmentPermissionsToRole(
                newRole.id,
                rolePermissions,
            );
        }
        return newRole;
    }

    async updateRole(role: IRoleUpdate): Promise<ICustomRole> {
        await this.validateRole(role, role.id);
        const baseRole = {
            id: role.id,
            name: role.name,
            description: role.description,
            roleType: CUSTOM_ROLE_TYPE,
        };
        const rolePermissions = role.permissions;
        const newRole = await this.roleStore.update(baseRole);
        if (rolePermissions) {
            await this.store.wipePermissionsFromRole(newRole.id);
            await this.store.addEnvironmentPermissionsToRole(
                newRole.id,
                rolePermissions,
            );
        }
        return newRole;
    }

    async deleteRole(id: number): Promise<void> {
        await this.validateRoleIsNotBuiltIn(id);

        const roleAccounts = await this.getAccountsForRole(id);

        if (roleAccounts.length > 0) {
            throw new RoleInUseError(
                'Role is in use by more than one account. You cannot delete a role that is in use without first removing the role from the accounts.',
            );
        }

        return this.roleStore.delete(id);
    }

    async validateRoleIsUnique(
        roleName: string,
        existingId?: number,
    ): Promise<void> {
        const exists = await this.roleStore.nameInUse(roleName, existingId);
        if (exists) {
            throw new NameExistsError(
                `There already exists a role with the name ${roleName}`,
            );
        }
        return Promise.resolve();
    }

    async validateRoleIsNotBuiltIn(roleId: number): Promise<void> {
        const role = await this.store.get(roleId);
        if (role.type !== CUSTOM_ROLE_TYPE) {
            throw new InvalidOperationError(
                'You cannot change built in roles.',
            );
        }
    }

    async validateRole(
        role: IRoleValidation,
        existingId?: number,
    ): Promise<IRoleCreation> {
        const cleanedRole = await roleSchema.validateAsync(role);
        if (existingId) {
            await this.validateRoleIsNotBuiltIn(existingId);
        }
        await this.validateRoleIsUnique(role.name, existingId);
        return cleanedRole;
    }

    async isChangeRequestsEnabled(
        project: string,
        environment: string,
    ): Promise<boolean> {
        return this.store.isChangeRequestsEnabled(project, environment);
    }
}
