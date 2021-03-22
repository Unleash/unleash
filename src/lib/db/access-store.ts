import { EventEmitter } from 'events';
import { Knex } from 'knex';
import metricsHelper from '../metrics-helper';
import { DB_TIME } from '../events';

const T = {
    ROLE_USER: 'role_user',
    ROLES: 'roles',
    ROLE_PERMISSION: 'role_permission',
};

export interface IUserPermission {
    project?: string;
    permission: string;
}

export interface IRole {
    id: number;
    name: string;
    description?: string;
    type: string;
    project?: string;
}

export class AccessStore {
    private logger: Function;

    private timer: Function;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: Function) {
        this.db = db;
        this.logger = getLogger('access-store.js');
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'access-store',
                action,
            });
    }

    async getPermissionsForUser(userId: Number): Promise<IUserPermission[]> {
        const stopTimer = this.timer('getPermissionsForUser');
        const rows = await this.db
            .select('project', 'permission')
            .from<IUserPermission>(`${T.ROLE_PERMISSION} AS rp`)
            .leftJoin(`${T.ROLE_USER} AS ur`, 'ur.role_id', 'rp.role_id')
            .where('user_id', '=', userId);
        stopTimer();
        return rows;
    }

    async getPermissionsForRole(roleId: number): Promise<IUserPermission[]> {
        const stopTimer = this.timer('getPermissionsForRole');
        const rows = await this.db
            .select('project', 'permission')
            .from<IUserPermission>(`${T.ROLE_PERMISSION}`)
            .where('role_id', '=', roleId);
        stopTimer();
        return rows;
    }

    async getRoles(): Promise<IRole[]> {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .from<IRole>(T.ROLES);
    }

    async getRoleWithId(id: number): Promise<IRole> {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .where('id', id)
            .first()
            .from<IRole>(T.ROLES);
    }

    async getRolesForProject(projectId: string): Promise<IRole[]> {
        return this.db
            .select(['id', 'name', 'type', 'project', 'description'])
            .from<IRole>(T.ROLES)
            .where('project', projectId)
            .andWhere('type', 'project');
    }

    async removeRolesForProject(projectId: string): Promise<void> {
        return this.db(T.ROLES)
            .where({
                project: projectId,
            })
            .delete();
    }

    async getRolesForUserId(userId: number): Promise<IRole[]> {
        return this.db
            .select(['id', 'name', 'type', 'project', 'description'])
            .from<IRole[]>(T.ROLES)
            .innerJoin(`${T.ROLE_USER} as ru`, 'ru.role_id', 'id')
            .where('ru.user_id', '=', userId);
    }

    async getUserIdsForRole(roleId: number): Promise<IRole[]> {
        const rows = await this.db
            .select(['user_id'])
            .from<IRole>(T.ROLE_USER)
            .where('role_id', roleId);
        return rows.map(r => r.user_id);
    }

    async addUserToRole(userId: number, roleId: number): Promise<void> {
        return this.db(T.ROLE_USER).insert({
            user_id: userId,
            role_id: roleId,
        });
    }

    async removeUserFromRole(userId: number, roleId: number): Promise<void> {
        return this.db(T.ROLE_USER)
            .where({
                user_id: userId,
                role_id: roleId,
            })
            .delete();
    }

    async createRole(
        name: string,
        type: string,
        project?: string,
        description?: string,
    ): Promise<IRole> {
        const [id] = await this.db(T.ROLES)
            .insert({ name, description, type, project })
            .returning('id');
        return { id, name, description, type, project };
    }

    async addPermissionsToRole(
        role_id: number,
        permissions: string[],
        projectId?: string,
    ): Promise<void> {
        const rows = permissions.map(permission => ({
            role_id,
            project: projectId,
            permission,
        }));
        return this.db.batchInsert(T.ROLE_PERMISSION, rows);
    }

    async removePermissionFromRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void> {
        return this.db(T.ROLE_PERMISSION)
            .where({
                role_id: roleId,
                permission,
                project: projectId,
            })
            .delete();
    }
}
