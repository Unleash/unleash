import * as permissions from '../types/permissions';
import User, { IUser } from '../types/user';
import {
    IAccessStore,
    IRole,
    IUserPermission,
    IUserRole,
} from '../types/stores/access-store';
import { IUserStore } from '../types/stores/user-store';
import { Logger } from '../logger';
import { IUnleashStores } from '../types/stores';
import {
    IPermission,
    IRoleData,
    IUserWithRole,
    PermissionType,
    RoleName,
    RoleType,
} from '../types/model';

export const ALL_PROJECTS = '*';

const PROJECT_DESCRIPTION = {
    OWNER: 'Users with this role have full control over the project, and can add and manage other users within the project context, manage feature toggles within the project, and control advanced project features like archiving and deleting the project.',
    MEMBER: 'Users with this role within a project are allowed to view, create and update feature toggles, but have limited permissions in regards to managing the projects user access and can not archive or delete the project.',
};

const { ADMIN } = permissions;

const PROJECT_ADMIN = [
    permissions.UPDATE_PROJECT,
    permissions.DELETE_PROJECT,
    permissions.CREATE_FEATURE,
    permissions.UPDATE_FEATURE,
    permissions.DELETE_FEATURE,
];

const PROJECT_REGULAR = [
    permissions.CREATE_FEATURE,
    permissions.UPDATE_FEATURE,
    permissions.DELETE_FEATURE,
];

const isProjectPermission = (permission) => PROJECT_ADMIN.includes(permission);

export class AccessService {
    private store: IAccessStore;

    private userStore: IUserStore;

    private logger: Logger;

    private permissions: IPermission[];

    constructor(
        {
            accessStore,
            userStore,
        }: Pick<IUnleashStores, 'accessStore' | 'userStore'>,
        { getLogger }: { getLogger: Function },
    ) {
        this.store = accessStore;
        this.userStore = userStore;
        this.logger = getLogger('/services/access-service.ts');
        this.permissions = Object.values(permissions).map((p) => ({
            name: p,
            type: isProjectPermission(p)
                ? PermissionType.project
                : PermissionType.root,
        }));
    }

    /**
     * Used to check if a user has access to the requested resource
     *
     * @param user
     * @param permission
     * @param projectId
     */
    async hasPermission(
        user: User,
        permission: string,
        projectId?: string,
    ): Promise<boolean> {
        this.logger.info(
            `Checking permission=${permission}, userId=${user.id} projectId=${projectId}`,
        );

        try {
            const userP = await this.store.getPermissionsForUser(user.id);

            return userP
                .filter(
                    (p) =>
                        !p.project ||
                        p.project === projectId ||
                        p.project === ALL_PROJECTS,
                )
                .some(
                    (p) =>
                        p.permission === permission || p.permission === ADMIN,
                );
        } catch (e) {
            this.logger.error(
                `Error checking permission=${permission}, userId=${user.id} projectId=${projectId}`,
                e,
            );
            return Promise.resolve(false);
        }
    }

    async getPermissionsForUser(user: User): Promise<IUserPermission[]> {
        if (user.isAPI) {
            return [];
        }
        return this.store.getPermissionsForUser(user.id);
    }

    getPermissions(): IPermission[] {
        return this.permissions;
    }

    async addUserToRole(userId: number, roleId: number): Promise<void> {
        return this.store.addUserToRole(userId, roleId);
    }

    async setUserRootRole(
        userId: number,
        role: number | RoleName,
    ): Promise<void> {
        const newRootRole = await this.resolveRootRole(role);

        if (newRootRole) {
            try {
                await this.store.removeRolesOfTypeForUser(
                    userId,
                    RoleType.ROOT,
                );
                await this.store.addUserToRole(userId, newRootRole.id);
            } catch (error) {
                throw new Error(
                    `Could not add role=${newRootRole.name} to userId=${userId}`,
                );
            }
        } else {
            throw new Error(`Could not find rootRole=${role}`);
        }
    }

    async getUserRootRoles(userId: number): Promise<IRole[]> {
        const userRoles = await this.store.getRolesForUserId(userId);
        return userRoles.filter((r) => r.type === RoleType.ROOT);
    }

    async removeUserFromRole(userId: number, roleId: number): Promise<void> {
        return this.store.removeUserFromRole(userId, roleId);
    }

    async addPermissionToRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void> {
        if (isProjectPermission(permission) && !projectId) {
            throw new Error(
                `ProjectId cannot be empty for permission=${permission}`,
            );
        }
        return this.store.addPermissionsToRole(roleId, [permission], projectId);
    }

    async removePermissionFromRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void> {
        if (isProjectPermission(permission) && !projectId) {
            throw new Error(
                `ProjectId cannot be empty for permission=${permission}`,
            );
        }
        return this.store.removePermissionFromRole(
            roleId,
            permission,
            projectId,
        );
    }

    async getRoles(): Promise<IRole[]> {
        return this.store.getRoles();
    }

    async getRole(roleId: number): Promise<IRoleData> {
        const [role, rolePerms, users] = await Promise.all([
            this.store.get(roleId),
            this.store.getPermissionsForRole(roleId),
            this.getUsersForRole(roleId),
        ]);
        return { role, permissions: rolePerms, users };
    }

    async getRolesForProject(projectId: string): Promise<IRole[]> {
        return this.store.getRolesForProject(projectId);
    }

    async getRolesForUser(userId: number): Promise<IRole[]> {
        return this.store.getRolesForUserId(userId);
    }

    async getUsersForRole(roleId: number): Promise<IUser[]> {
        const userIdList = await this.store.getUserIdsForRole(roleId);
        if (userIdList.length > 0) {
            return this.userStore.getAllWithId(userIdList);
        }
        return [];
    }

    // Move to project-service?
    async getProjectRoleUsers(
        projectId: string,
    ): Promise<[IRole[], IUserWithRole[]]> {
        const roles = await this.store.getRolesForProject(projectId);

        const users = await Promise.all(
            roles.map(async (role) => {
                const usrs = await this.getUsersForRole(role.id);
                return usrs.map((u) => ({ ...u, roleId: role.id }));
            }),
        );
        return [roles, users.flat()];
    }

    async createDefaultProjectRoles(
        owner: User,
        projectId: string,
    ): Promise<void> {
        if (!projectId) {
            throw new Error('ProjectId cannot be empty');
        }

        const ownerRole = await this.store.createRole(
            RoleName.OWNER,
            RoleType.PROJECT,
            projectId,
            PROJECT_DESCRIPTION.OWNER,
        );
        await this.store.addPermissionsToRole(
            ownerRole.id,
            PROJECT_ADMIN,
            projectId,
        );

        // TODO: remove this when all users is guaranteed to have a unique id.
        if (owner.id) {
            this.logger.info(
                `Making ${owner.id} admin of ${projectId} via roleId=${ownerRole.id}`,
            );
            await this.store.addUserToRole(owner.id, ownerRole.id);
        }
        const memberRole = await this.store.createRole(
            RoleName.MEMBER,
            RoleType.PROJECT,
            projectId,
            PROJECT_DESCRIPTION.MEMBER,
        );
        await this.store.addPermissionsToRole(
            memberRole.id,
            PROJECT_REGULAR,
            projectId,
        );
    }

    async removeDefaultProjectRoles(
        owner: User,
        projectId: string,
    ): Promise<void> {
        this.logger.info(`Removing project roles for ${projectId}`);
        return this.store.removeRolesForProject(projectId);
    }

    async getRootRoleForAllUsers(): Promise<IUserRole[]> {
        return this.store.getRootRoleForAllUsers();
    }

    async getRootRoles(): Promise<IRole[]> {
        return this.store.getRootRoles();
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
        const roles = await this.store.getRootRoles();
        return roles.find((r) => r.name === roleName);
    }
}
