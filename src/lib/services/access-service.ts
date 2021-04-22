import {
    AccessStore,
    IRole,
    IUserPermission,
    IUserRole,
} from '../db/access-store';
import permissions from '../permissions';
import User from '../types/user';

export const ALL_PROJECTS = '*';

const PROJECT_DESCRIPTION = {
    OWNER:
        'Users with this role have full control over the project, and can add and manage other users within the project context, manage feature toggles within the project, and control advanced project features like archiving and deleting the project.',
    MEMBER:
        'Users with this role within a project are allowed to view, create and update feature toggles, but have limited permissions in regards to managing the projects user access and can not archive or delete the project.',
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

const isProjectPermission = permission => PROJECT_ADMIN.includes(permission);

interface IStores {
    accessStore: AccessStore;
    userStore: any;
}

export interface IUserWithRole {
    id: number;
    roleId: number;
    name?: string;
    username?: string;
    email?: string;
    imageUrl?: string;
}

export interface IRoleData {
    role: IRole;
    users: User[];
    permissions: IUserPermission[];
}

export interface IPermission {
    name: string;
    type: PermissionType;
}

enum PermissionType {
    root = 'root',
    project = 'project',
}

export enum RoleName {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    ADMIN = 'Admin',
    EDITOR = 'Editor',
    VIEWER = 'Viewer',
    OWNER = 'Owner',
    MEMBER = 'Member',
}

export enum RoleType {
    ROOT = 'root',
    PROJECT = 'project',
}

export interface IRoleIdentifier {
    roleId?: number;
    roleName?: RoleName;
}

export class AccessService {
    public RoleName = RoleName;

    private store: AccessStore;

    private userStore: any;

    private logger: any;

    private permissions: IPermission[];

    constructor(
        { accessStore, userStore }: IStores,
        { getLogger }: { getLogger: Function },
    ) {
        this.store = accessStore;
        this.userStore = userStore;
        this.logger = getLogger('/services/access-service.ts');
        this.permissions = Object.values(permissions).map(p => ({
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

        const userP = await this.store.getPermissionsForUser(user.id);

        return userP
            .filter(
                p =>
                    !p.project ||
                    p.project === projectId ||
                    p.project === ALL_PROJECTS,
            )
            .some(p => p.permission === permission || p.permission === ADMIN);
    }

    async getPermissionsForUser(user: User): Promise<IUserPermission[]> {
        return this.store.getPermissionsForUser(user.id);
    }

    getPermissions(): IPermission[] {
        return this.permissions;
    }

    async addUserToRole(userId: number, roleId: number): Promise<void> {
        return this.store.addUserToRole(userId, roleId);
    }

    async setUserRootRole(userId: number, roleId: number): Promise<void> {
        const roles = await this.getRootRoles();
        const newRootRole = roles.find(r => r.id === roleId);

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
            throw new Error(`Could not find rootRole with id=${roleId}`);
        }
    }

    async getUserRootRoles(userId: number): Promise<IRole[]> {
        const userRoles = await this.store.getRolesForUserId(userId);
        return userRoles.filter(r => r.type === RoleType.ROOT);
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
            this.store.getRoleWithId(roleId),
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

    async getUsersForRole(roleId: number): Promise<User[]> {
        const userIdList = await this.store.getUserIdsForRole(roleId);
        return this.userStore.getAllWithId(userIdList);
    }

    // Move to project-service?
    async getProjectRoleUsers(
        projectId: string,
    ): Promise<[IRole[], IUserWithRole[]]> {
        const roles = await this.store.getRolesForProject(projectId);

        const users = await Promise.all(
            roles.map(async role => {
                const usrs = await this.getUsersForRole(role.id);
                return usrs.map(u => ({ ...u, roleId: role.id }));
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

    async getRootRole(roleName: RoleName): Promise<IRole> {
        const roles = await this.store.getRootRoles();
        return roles.find(r => r.name === roleName);
    }
}
