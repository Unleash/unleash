import { EventEmitter } from 'events';
import { Knex } from 'knex';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger } from '../logger';
import {
    IAccessInfo,
    IAccessStore,
    IRole,
    IRoleWithProject,
    IUserPermission,
    IUserRole,
} from '../types/stores/access-store';
import { IPermission } from '../types/model';
import NotFoundError from '../error/notfound-error';
import {
    ENVIRONMENT_PERMISSION_TYPE,
    ROOT_PERMISSION_TYPE,
} from '../util/constants';

const T = {
    ROLE_USER: 'role_user',
    ROLES: 'roles',
    GROUPS: 'groups',
    GROUP_ROLE: 'group_role',
    GROUP_USER: 'group_user',
    ROLE_PERMISSION: 'role_permission',
    PERMISSIONS: 'permissions',
    PERMISSION_TYPES: 'permission_types',
};

interface IPermissionRow {
    id: number;
    permission: string;
    display_name: string;
    environment?: string;
    type: string;
    project?: string;
    role_id: number;
}

export class AccessStore implements IAccessStore {
    private logger: Logger;

    private timer: Function;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: Function) {
        this.db = db;
        this.logger = getLogger('access-store.ts');
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'access-store',
                action,
            });
    }

    async delete(key: number): Promise<void> {
        await this.db(T.ROLES).where({ id: key }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(T.ROLES).del();
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${T.ROLES} WHERE id = ?) AS present`,
            [key],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(key: number): Promise<IRole> {
        const role = await this.db
            .select(['id', 'name', 'type', 'description'])
            .where('id', key)
            .first()
            .from<IRole>(T.ROLES);

        if (!role) {
            throw new NotFoundError(`Could not find role with id: ${key}`);
        }

        return role;
    }

    async getAll(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    async getAvailablePermissions(): Promise<IPermission[]> {
        const rows = await this.db
            .select(['id', 'permission', 'type', 'display_name'])
            .where('type', 'project')
            .orWhere('type', 'environment')
            .from(`${T.PERMISSIONS} as p`);
        return rows.map(this.mapPermission);
    }

    mapPermission(permission: IPermissionRow): IPermission {
        return {
            id: permission.id,
            name: permission.permission,
            displayName: permission.display_name,
            type: permission.type,
        };
    }

    async getPermissionsForUser(userId: number): Promise<IUserPermission[]> {
        const stopTimer = this.timer('getPermissionsForUser');
        let userPermissionQuery = this.db
            .select(
                'project',
                'permission',
                'environment',
                'type',
                'ur.role_id',
            )
            .from<IPermissionRow>(`${T.ROLE_PERMISSION} AS rp`)
            .join(`${T.ROLE_USER} AS ur`, 'ur.role_id', 'rp.role_id')
            .join(`${T.PERMISSIONS} AS p`, 'p.id', 'rp.permission_id')
            .where('ur.user_id', '=', userId);

        userPermissionQuery = userPermissionQuery.union((db) => {
            db.select(
                'project',
                'permission',
                'environment',
                'p.type',
                'gr.role_id',
            )
                .from<IPermissionRow>(`${T.GROUP_USER} AS gu`)
                .join(`${T.GROUPS} AS g`, 'g.id', 'gu.group_id')
                .join(`${T.GROUP_ROLE} AS gr`, 'gu.group_id', 'gr.group_id')
                .join(`${T.ROLE_PERMISSION} AS rp`, 'rp.role_id', 'gr.role_id')
                .join(`${T.PERMISSIONS} AS p`, 'p.id', 'rp.permission_id')
                .where('gu.user_id', '=', userId);
        });
        const rows = await userPermissionQuery;
        stopTimer();
        return rows.map(this.mapUserPermission);
    }

    mapUserPermission(row: IPermissionRow): IUserPermission {
        let project: string = undefined;
        // Since the editor should have access to the default project,
        // we map the project to the project and environment specific
        // permissions that are connected to the editor role.
        if (row.type !== ROOT_PERMISSION_TYPE) {
            project = row.project;
        }

        const environment =
            row.type === ENVIRONMENT_PERMISSION_TYPE
                ? row.environment
                : undefined;

        return {
            project,
            environment,
            permission: row.permission,
        };
    }

    async getPermissionsForRole(roleId: number): Promise<IPermission[]> {
        const stopTimer = this.timer('getPermissionsForRole');
        const rows = await this.db
            .select(
                'p.id',
                'p.permission',
                'rp.environment',
                'p.display_name',
                'p.type',
            )
            .from<IPermission>(`${T.ROLE_PERMISSION} as rp`)
            .join(`${T.PERMISSIONS} as p`, 'p.id', 'rp.permission_id')
            .where('rp.role_id', '=', roleId);
        stopTimer();
        return rows.map((permission) => {
            return {
                id: permission.id,
                name: permission.permission,
                environment: permission.environment,
                displayName: permission.display_name,
                type: permission.type,
            };
        });
    }

    async addEnvironmentPermissionsToRole(
        role_id: number,
        permissions: IPermission[],
    ): Promise<void> {
        const rows = permissions.map((permission) => {
            return {
                role_id,
                permission_id: permission.id,
                environment: permission.environment,
            };
        });
        await this.db.batchInsert(T.ROLE_PERMISSION, rows);
    }

    async unlinkUserRoles(userId: number): Promise<void> {
        return this.db(T.ROLE_USER)
            .where({
                user_id: userId,
            })
            .delete();
    }

    async getProjectUsersForRole(
        roleId: number,
        projectId?: string,
    ): Promise<IUserRole[]> {
        const rows = await this.db
            .select(['user_id', 'ru.created_at'])
            .from<IRole>(`${T.ROLE_USER} AS ru`)
            .join(`${T.ROLES} as r`, 'ru.role_id', 'id')
            .where('r.id', roleId)
            .andWhere('ru.project', projectId);
        return rows.map((r) => ({
            userId: r.user_id,
            addedAt: r.created_at,
        }));
    }

    async getRolesForUserId(userId: number): Promise<IRoleWithProject[]> {
        return this.db
            .select(['id', 'name', 'type', 'project', 'description'])
            .from<IRole[]>(T.ROLES)
            .innerJoin(`${T.ROLE_USER} as ru`, 'ru.role_id', 'id')
            .where('ru.user_id', '=', userId);
    }

    async getUserIdsForRole(roleId: number): Promise<number[]> {
        const rows = await this.db
            .select(['user_id'])
            .from<IRole>(T.ROLE_USER)
            .where('role_id', roleId);
        return rows.map((r) => r.user_id);
    }

    async addUserToRole(
        userId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void> {
        return this.db(T.ROLE_USER).insert({
            user_id: userId,
            role_id: roleId,
            project: projectId,
        });
    }

    async removeUserFromRole(
        userId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void> {
        return this.db(T.ROLE_USER)
            .where({
                user_id: userId,
                role_id: roleId,
                project: projectId,
            })
            .delete();
    }

    async addGroupToRole(
        groupId: number,
        roleId: number,
        createdBy: string,
        projectId?: string,
    ): Promise<void> {
        return this.db(T.GROUP_ROLE).insert({
            group_id: groupId,
            role_id: roleId,
            project: projectId,
            created_by: createdBy,
        });
    }

    async removeGroupFromRole(
        groupId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void> {
        return this.db(T.GROUP_ROLE)
            .where({
                group_id: groupId,
                role_id: roleId,
                project: projectId,
            })
            .delete();
    }

    async updateUserProjectRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        return this.db(T.ROLE_USER)
            .where({
                user_id: userId,
                project: projectId,
            })
            .whereNotIn(
                'role_id',
                this.db(T.ROLES).select('id as role_id').where('type', 'root'),
            )
            .update('role_id', roleId);
    }

    updateGroupProjectRole(
        groupId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        return this.db(T.GROUP_ROLE)
            .where({
                group_id: groupId,
                project: projectId,
            })
            .whereNotIn(
                'role_id',
                this.db(T.ROLES).select('id as role_id').where('type', 'root'),
            )
            .update('role_id', roleId);
    }

    async addAccessToProject(
        users: IAccessInfo[],
        groups: IAccessInfo[],
        projectId: string,
        roleId: number,
        createdBy: string,
    ): Promise<void> {
        const userRows = users.map((user) => {
            return {
                user_id: user.id,
                project: projectId,
                role_id: roleId,
            };
        });

        const groupRows = groups.map((group) => {
            return {
                group_id: group.id,
                project: projectId,
                role_id: roleId,
                created_by: createdBy,
            };
        });

        await this.db.transaction(async (tx) => {
            if (userRows.length > 0) {
                await tx(T.ROLE_USER)
                    .insert(userRows)
                    .onConflict(['project', 'role_id', 'user_id'])
                    .merge();
            }
            if (groupRows.length > 0) {
                await tx(T.GROUP_ROLE)
                    .insert(groupRows)
                    .onConflict(['project', 'role_id', 'group_id'])
                    .merge();
            }
        });
    }

    async removeRolesOfTypeForUser(
        userId: number,
        roleType: string,
    ): Promise<void> {
        const rolesToRemove = this.db(T.ROLES)
            .select('id')
            .where({ type: roleType });

        return this.db(T.ROLE_USER)
            .where({ user_id: userId })
            .whereIn('role_id', rolesToRemove)
            .delete();
    }

    async addPermissionsToRole(
        role_id: number,
        permissions: string[],
        environment?: string,
    ): Promise<void> {
        const rows = await this.db
            .select('id as permissionId')
            .from<number>(T.PERMISSIONS)
            .whereIn('permission', permissions);

        const newRoles = rows.map((row) => ({
            role_id,
            environment,
            permission_id: row.permissionId,
        }));

        return this.db.batchInsert(T.ROLE_PERMISSION, newRoles);
    }

    async removePermissionFromRole(
        role_id: number,
        permission: string,
        environment?: string,
    ): Promise<void> {
        const rows = await this.db
            .select('id as permissionId')
            .from<number>(T.PERMISSIONS)
            .where('permission', permission);

        const permissionId = rows[0].permissionId;

        return this.db(T.ROLE_PERMISSION)
            .where({
                role_id,
                permission_id: permissionId,
                environment,
            })
            .delete();
    }

    async wipePermissionsFromRole(role_id: number): Promise<void> {
        return this.db(T.ROLE_PERMISSION)
            .where({
                role_id,
            })
            .delete();
    }
}
