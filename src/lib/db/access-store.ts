import { EventEmitter } from 'events';
import { Knex } from 'knex';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger } from '../logger';
import {
    IAccessStore,
    IRole,
    IUserPermission,
    IUserRole,
} from '../types/stores/access-store';
import {
    IAvailablePermissions,
    IEnvironmentPermission,
    IPermission,
} from 'lib/types/model';

const T = {
    ROLE_USER: 'role_user',
    ROLES: 'roles',
    ROLE_PERMISSION: 'role_permission',
    PERMISSIONS: 'permissions',
    PERMISSION_TYPES: 'permission_types',
};

interface IPermissionRow {
    id: number;
    permission: string;
    display_name: string;
    environment: string;
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

    async setupPermissionsForEnvironment(
        environmentName: string,
        permissions: string[],
    ): Promise<void> {
        const rows = permissions.map((permission) => {
            return {
                permission: permission,
                display_name: '',
                environment: environmentName,
            };
        });
        await this.db.batchInsert(T.PERMISSIONS, rows);
    }

    async getRoleByName(name: string): Promise<IRole> {
        return this.db(T.ROLES).where({ name }).first();
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
            `SELECT EXISTS (SELECT 1 FROM ${T.ROLES} WHERE id = ?) AS present`,
            [key],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(key: number): Promise<IRole> {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .where('id', key)
            .first()
            .from<IRole>(T.ROLES);
    }

    async getAll(): Promise<IRole[]> {
        return Promise.resolve([]);
    }

    async getAvailablePermissions(): Promise<IAvailablePermissions> {
        const rows = await this.db
            .select([
                'p.id',
                'p.permission',
                'p.environment',
                'pt.display_name',
            ])
            .join(
                `${T.PERMISSION_TYPES} AS pt`,
                'pt.permission',
                'p.permission',
            )
            .where('pt.type', 'project')
            .orWhere('pt.type', 'environment')
            .from(`${T.PERMISSIONS} as p`);

        let projectPermissions: IPermission[] = [];
        let rawEnvironments = new Map<string, IPermissionRow[]>();

        for (let permission of rows) {
            if (!permission.environment) {
                projectPermissions.push(this.mapPermission(permission));
            } else {
                if (!rawEnvironments.get(permission.environment)) {
                    rawEnvironments.set(permission.environment, []);
                }
                rawEnvironments.get(permission.environment).push(permission);
            }
        }
        let allEnvironmentPermissions: Array<IEnvironmentPermission> =
            Array.from(rawEnvironments).map(
                ([environmentName, environmentPermissions]) => {
                    return {
                        name: environmentName,
                        permissions: environmentPermissions.map(
                            this.mapPermission,
                        ),
                    };
                },
            );
        return {
            project: projectPermissions,
            environments: allEnvironmentPermissions,
        };
    }

    mapPermission(permission: IPermissionRow): IPermission {
        return {
            id: permission.id,
            name: permission.permission,
            displayName: permission.display_name,
        };
    }

    async getPermissionsForUser(userId: number): Promise<IUserPermission[]> {
        const stopTimer = this.timer('getPermissionsForUser');
        const rows = await this.db
            .select('project', 'permission', 'environment')
            .from<IUserPermission>(`${T.ROLE_PERMISSION} AS rp`)
            .join(`${T.ROLE_USER} AS ur`, 'ur.role_id', 'rp.role_id')
            .join(`${T.PERMISSIONS} AS p`, 'p.id', 'rp.permission_id')
            .where('ur.user_id', '=', userId);
        stopTimer();
        return rows;
    }

    async getPermissionsForRole(roleId: number): Promise<IPermission[]> {
        const stopTimer = this.timer('getPermissionsForRole');
        const rows = await this.db
            .select('p.id', 'p.permission', 'p.environment', 'pt.display_name')
            .from<IPermission>(`${T.ROLE_PERMISSION} as rp`)
            .join(`${T.PERMISSIONS} as p`, 'p.id', 'rp.permission_id')
            .join(
                `${T.PERMISSION_TYPES} as pt`,
                'pt.permission',
                'p.permission',
            )
            .where('rp.role_id', '=', roleId);
        stopTimer();
        return rows.map((permission) => {
            return {
                id: permission.id,
                name: permission.permission,
                environment: permission.environment,
                displayName: permission.display_name,
            };
        });
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

    async getProjectRoles(): Promise<IRole[]> {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .from<IRole>(T.ROLES)
            .where('type', 'custom')
            .orWhere('type', 'project');
    }

    async getRolesForProject(projectId: string): Promise<IRole[]> {
        return this.db
            .select(['r.id', 'r.name', 'r.type', 'ru.project', 'r.description'])
            .from<IRole>(`${T.ROLE_USER} as ru`)
            .innerJoin(`${T.ROLES} as r`, 'ru.role_id', 'r.id')
            .where('project', projectId);
    }

    async unlinkUserRoles(userId: number): Promise<void> {
        return this.db(T.ROLE_USER)
            .where({
                user_id: userId,
            })
            .delete();
    }

    async getRootRoles(): Promise<IRole[]> {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .from<IRole>(T.ROLES)
            .andWhere('type', 'root');
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

    async getUserIdsForRole(roleId: number): Promise<number[]> {
        const rows = await this.db
            .select(['user_id'])
            .from<IRole>(T.ROLE_USER)
            .where('role_id', roleId);
        return rows.map((r) => r.user_id);
    }

    async getProjectUserIdsForRole(
        roleId: number,
        projectId?: string,
    ): Promise<number[]> {
        console.log('Checking for', roleId, projectId);
        const rows = await this.db
            .select(['user_id'])
            .from<IRole>(`${T.ROLE_USER} AS ru`)
            .join(`${T.ROLES} as r`, 'ru.role_id', 'id')
            .where('r.id', roleId)
            .andWhere('ru.project', projectId);
        return rows.map((r) => r.user_id);
    }

    async addUserToRole(
        userId: number,
        roleId: number,
        projecId: string,
    ): Promise<void> {
        return this.db(T.ROLE_USER).insert({
            user_id: userId,
            role_id: roleId,
            project: projecId,
        });
    }

    async removeUserFromRole(
        userId: number,
        roleId: number,
        projectId: string,
    ): Promise<void> {
        return this.db(T.ROLE_USER)
            .where({
                user_id: userId,
                role_id: roleId,
                project: projectId,
            })
            .delete();
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

    async createRole(
        name: string,
        type: string,
        description?: string,
    ): Promise<IRole> {
        const [id] = await this.db(T.ROLES)
            .insert({
                name,
                description,
                type,
            })
            .returning('id');
        return {
            id,
            name,
            description,
            type,
        };
    }

    async addEnvironmentPermissionsToRole(
        role_id: number,
        permissions: IPermission[],
    ): Promise<void> {
        const rows = permissions.map((x) => {
            return {
                role_id,
                permission_id: x.id,
            };
        });
        this.db.batchInsert(T.ROLE_PERMISSION, rows);
    }

    async addPermissionsToRole(
        role_id: number,
        permissions: string[],
        environment?: string,
    ): Promise<void> {
        const result = await this.db.raw(
            `SELECT id FROM ${T.PERMISSIONS} where environment = ? and permission = ANY(?)`,
            [environment, permissions],
        );

        console.log(
            'Adding permissions to table',
            role_id,
            permissions,
            environment,
        );
        const ids = result.rows.map((x) => x.id);

        const rows = ids.map((permission_id) => ({
            role_id,
            permission_id,
        }));

        console.log('Final inssert', rows);
        return this.db.batchInsert(T.ROLE_PERMISSION, rows);
    }

    async removePermissionFromRole(
        role_id: number,
        permission: string,
        environment?: string,
    ): Promise<void> {
        const result = await this.db.raw(
            `SELECT id FROM ${T.PERMISSIONS} where environment = ? and permission = ?`,
            [environment, permission],
        );

        const permissionId = result.first();

        return this.db(T.ROLE_PERMISSION)
            .where({
                role_id,
                permissionId,
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

    async getRootRoleForAllUsers(): Promise<IUserRole[]> {
        const rows = await this.db
            .select('id', 'user_id')
            .distinctOn('user_id')
            .from(`${T.ROLES} AS r`)
            .leftJoin(`${T.ROLE_USER} AS ru`, 'r.id', 'ru.role_id')
            .where('r.type', '=', 'root');

        return rows.map((row) => ({
            roleId: +row.id,
            userId: +row.user_id,
        }));
    }
}
