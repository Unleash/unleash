import { AccessStore, IRole, IUserPermission, IUserRole } from '../db/access-store';
import p from '../permissions';
import User from '../user';

export const ALL_PROJECTS = '*';

const PROJECT_DESCRIPTION = {
    ADMIN: 'Users with the project admin role have full control over the project, and can add and manage other users within the project context, manage feature toggles within the project, and control advanced project features like archiving and deleting the project.',
    REGULAR: 'Users with the regular role within a project are allowed to view, create and update feature toggles, but have limited permissions in regards to managing the projects user access and can not archive or delete the project.',
};

const { ADMIN } = p;

const PROJECT_ADMIN = [
    p.UPDATE_PROJECT,
    p.DELETE_PROJECT,
    p.CREATE_FEATURE,
    p.UPDATE_FEATURE,
    p.DELETE_FEATURE,
];

const PROJECT_REGULAR = [p.CREATE_FEATURE, p.UPDATE_FEATURE, p.DELETE_FEATURE];

const isProjectPermission = permission => PROJECT_ADMIN.includes(permission);

interface IStores {
    accessStore: AccessStore;
    userStore: any;
}

export interface IUserWithRole {
    id: number;
    roleId: number;
    name?: string
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
    root='root',
    project='project',
}

export enum RoleName {
    ADMIN = 'Admin',
    REGULAR = 'Regular',
    READ = 'Read',
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

    constructor({ accessStore, userStore }: IStores, { getLogger } : { getLogger: Function}) {
        this.store = accessStore;
        this.userStore = userStore;
        this.logger = getLogger('/services/access-service.ts');
        this.permissions = Object.values(p).map(p => ({
            name: p,
            type: isProjectPermission(p) ? PermissionType.project : PermissionType.root
        }))
    }

    /**
     * Used to check if a user has access to the requested resource
     * 
     * @param user 
     * @param permission 
     * @param projectId 
     */
    async hasPermission(user: User, permission: string, projectId?: string): Promise<boolean> {
        this.logger.info(`Checking permission=${permission}, userId=${user.id} projectId=${projectId}`)

        const permissions = await this.store.getPermissionsForUser(user.id);

        return permissions
                .filter(p => !p.project || p.project === projectId || p.project === ALL_PROJECTS)
                .some(p => p.permission === permission || p.permission === ADMIN);
    }

    getPermissions(): IPermission[] {
        return this.permissions;
    }

    async addUserToRole(userId: number, roleId: number) {
        return this.store.addUserToRole(userId, roleId);
    }

    async setUserRootRole(userId: number, roleId: number) {
        const currentRootRoles = await this.getUserRootRoles(userId);        
        const roles = await this.getRootRoles();
        const newRootRole = roles.find(r => r.id === roleId);
        
        if(newRootRole) {
            try {
                await Promise.all(currentRootRoles.map(r => this.store.removeUserFromRole(userId, r.id)));
                await this.store.addUserToRole(userId, newRootRole.id);
            } catch (error) {
                this.logger.warn('Could not add role=${roleName} to userId=${userId}');
            }
        } else {
            throw new Error(`Could not find rootRole with id=${roleId}`);
        }
    }

    async getUserRootRoles(userId: number) {
        const userRoles = await this.store.getRolesForUserId(userId);
        return userRoles.filter(r => r.type === RoleType.ROOT);
    }

    async removeUserFromRole(userId: number, roleId: number) {
        return this.store.removeUserFromRole(userId, roleId);
    }

    async addPermissionToRole(roleId: number, permission: string, projectId?: string) {
        if(isProjectPermission(permission) && !projectId) {
            throw new Error(`ProjectId cannot be empty for permission=${permission}`)
        } 
        return this.store.addPermissionsToRole(roleId, [permission], projectId);
    }

    async removePermissionFromRole(roleId: number, permission: string, projectId?: string) {
        if(isProjectPermission(permission) && !projectId) {
            throw new Error(`ProjectId cannot be empty for permission=${permission}`)
        }
        return this.store.removePermissionFromRole(roleId, permission, projectId);
    }

    async getRoles(): Promise<IRole[]> {
        return this.store.getRoles();
    }

    async getRole(roleId: number): Promise<IRoleData> {
        const [role, permissions, users] = await Promise.all([
            this.store.getRoleWithId(roleId),
            this.store.getPermissionsForRole(roleId),
            this.getUsersForRole(roleId),
        ]);
        return { role, permissions, users };
    }

    async getRolesForProject(projectId: string): Promise<IRole[]> {
        return this.store.getRolesForProject(projectId);
    }

    async getRolesForUser(userId: number): Promise<IRole[]> {
        return this.store.getRolesForUserId(userId);
    }

    async getUsersForRole(roleId) : Promise<User[]> {
        const userIdList = await this.store.getUserIdsForRole(roleId);
        return this.userStore.getAllWithId(userIdList);
    }

    // Move to project-service?
    async getProjectRoleUsers(projectId: string): Promise<[IRole[], IUserWithRole[]]> {
        const roles = await this.store.getRolesForProject(projectId);

        const users = await Promise.all(roles.map(async role => {
            const users = await this.getUsersForRole(role.id);
            return users.map(u => ({ ...u, roleId: role.id }))
        }));
        return [roles, users.flat()];
    }

    async createDefaultProjectRoles(owner: User, projectId: string) {
        if(!projectId) {
            throw new Error("ProjectId cannot be empty");
        }

        const adminRole = await this.store.createRole(
            RoleName.ADMIN,
            RoleType.PROJECT,
            projectId,
            PROJECT_DESCRIPTION.ADMIN,
        );
        await this.store.addPermissionsToRole(
            adminRole.id,
            PROJECT_ADMIN,
            projectId,
        );

        // TODO: remove this when all users is guaranteed to have a unique id. 
        if (owner.id) {
            this.logger.info(`Making ${owner.id} admin of ${projectId} via roleId=${adminRole.id}`);
            await this.store.addUserToRole(owner.id, adminRole.id);    
        };
        
        const regularRole = await this.store.createRole(
            RoleName.REGULAR,
            RoleType.PROJECT,
            projectId,
            PROJECT_DESCRIPTION.REGULAR,
        );
        await this.store.addPermissionsToRole(
            regularRole.id,
            PROJECT_REGULAR,
            projectId
        );
    }

    async removeDefaultProjectRoles(owner: User, projectId: string) {
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
