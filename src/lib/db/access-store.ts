import type { EventEmitter } from 'events';
import metricsHelper from '../util/metrics-helper.js';
import { DB_TIME } from '../metric-events.js';
import type {
    IAccessStore,
    IProjectRoleUsage,
    IRole,
    IRoleWithProject,
    IUserPermission,
    IUserRole,
    IUserWithProjectRoles,
} from '../types/stores/access-store.js';
import type { IPermission, IUserAccessOverview } from '../types/model.js';
import NotFoundError from '../error/notfound-error.js';
import {
    ENVIRONMENT_PERMISSION_TYPE,
    PROJECT_ROLE_TYPES,
    ROOT_PERMISSION_TYPE,
    ROOT_ROLE_TYPES,
} from '../util/constants.js';
import type { Db } from './db.js';
import type {
    IdPermissionRef,
    NamePermissionRef,
    PermissionRef,
} from '../services/access-service.js';
import { inTransaction } from './transaction.js';
import BadDataError from '../error/bad-data-error.js';

const T = {
    ROLE_USER: 'role_user',
    ROLES: 'roles',
    GROUPS: 'groups',
    GROUP_ROLE: 'group_role',
    GROUP_USER: 'group_user',
    ROLE_PERMISSION: 'role_permission',
    PERMISSIONS: 'permissions',
    PERMISSION_TYPES: 'permission_types',
    CHANGE_REQUEST_SETTINGS: 'change_request_settings',
    PERSONAL_ACCESS_TOKENS: 'personal_access_tokens',
    PUBLIC_SIGNUP_TOKENS_USER: 'public_signup_tokens_user',
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

type NameAndIdPermission = NamePermissionRef & IdPermissionRef;

export class AccessStore implements IAccessStore {
    private timer: Function;

    private db: Db;

    constructor(db: Db, eventBus: EventEmitter, _getLogger: Function) {
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'access-store',
                action,
            });
    }

    private permissionHasName = (permission: PermissionRef): boolean => {
        return (permission as NamePermissionRef).name !== undefined;
    };

    private permissionIdsToNames = async (
        permissions: IdPermissionRef[],
    ): Promise<NameAndIdPermission[]> => {
        const permissionIds = (permissions ?? [])
            .filter((p) => p.id !== undefined)
            .map((p) => p.id);

        if (permissionIds.length === 0) {
            return [];
        }

        const stopTimer = this.timer('permissionIdsToNames');

        const rows = await this.db
            .select('id', 'permission')
            .from(T.PERMISSIONS)
            .whereIn('id', permissionIds);

        const rowByPermissionId = rows.reduce(
            (acc, row) => {
                acc[row.id] = row;
                return acc;
            },
            {} as Map<string, IPermissionRow>,
        );

        const permissionsWithNames = permissions.map((permission) => ({
            name: rowByPermissionId[permission.id].permission,
            ...permission,
        }));

        stopTimer();
        return permissionsWithNames;
    };

    resolvePermissions = async (
        permissions: PermissionRef[],
    ): Promise<NamePermissionRef[]> => {
        if (permissions === undefined || permissions.length === 0) {
            return [];
        }
        // permissions without names (just ids)
        const permissionsWithoutNames = permissions.filter(
            (p) => !this.permissionHasName(p),
        ) as IdPermissionRef[];

        if (permissionsWithoutNames.length === permissions.length) {
            // all permissions without names
            return await this.permissionIdsToNames(permissionsWithoutNames);
        } else if (permissionsWithoutNames.length === 0) {
            // all permissions have names
            return permissions as NamePermissionRef[];
        }

        // some permissions have names, some don't (should not happen!)
        const namedPermissionsFromIds = await this.permissionIdsToNames(
            permissionsWithoutNames,
        );
        return permissions.map((permission) => {
            if (this.permissionHasName(permission)) {
                return permission as NamePermissionRef;
            } else {
                return namedPermissionsFromIds.find(
                    (p) => p.id === (permission as IdPermissionRef).id,
                )!;
            }
        });
    };

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
            .orWhere('type', 'root')
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
                'rp.permission',
                'environment',
                'type',
                'ur.role_id',
            )
            .from<IPermissionRow>(`${T.ROLE_PERMISSION} AS rp`)
            .join(`${T.ROLE_USER} AS ur`, 'ur.role_id', 'rp.role_id')
            .join(`${T.PERMISSIONS} AS p`, 'p.permission', 'rp.permission')
            .where('ur.user_id', '=', userId);

        userPermissionQuery = userPermissionQuery.union((db) => {
            db.select(
                'project',
                'rp.permission',
                'environment',
                'p.type',
                'gr.role_id',
            )
                .from<IPermissionRow>(`${T.GROUP_USER} AS gu`)
                .join(`${T.GROUPS} AS g`, 'g.id', 'gu.group_id')
                .join(`${T.GROUP_ROLE} AS gr`, 'gu.group_id', 'gr.group_id')
                .join(`${T.ROLE_PERMISSION} AS rp`, 'rp.role_id', 'gr.role_id')
                .join(`${T.PERMISSIONS} AS p`, 'p.permission', 'rp.permission')
                .andWhere('gu.user_id', '=', userId);
        });

        userPermissionQuery = userPermissionQuery.union((db) => {
            db.select(
                this.db.raw("'default' as project"),
                'rp.permission',
                'environment',
                'p.type',
                'g.root_role_id as role_id',
            )
                .from<IPermissionRow>(`${T.GROUP_USER} as gu`)
                .join(`${T.GROUPS} AS g`, 'g.id', 'gu.group_id')
                .join(
                    `${T.ROLE_PERMISSION} as rp`,
                    'rp.role_id',
                    'g.root_role_id',
                )
                .join(`${T.PERMISSIONS} as p`, 'p.permission', 'rp.permission')
                .whereNotNull('g.root_role_id')
                .andWhere('gu.user_id', '=', userId);
        });
        const rows = await userPermissionQuery;
        stopTimer();
        return rows.map(this.mapUserPermission);
    }

    mapUserPermission(row: IPermissionRow): IUserPermission {
        let project: string | undefined;
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
                'rp.permission',
                'rp.environment',
                'p.display_name',
                'p.type',
            )
            .from<IPermission>(`${T.ROLE_PERMISSION} as rp`)
            .join(`${T.PERMISSIONS} as p`, 'p.permission', 'rp.permission')
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
        permissions: PermissionRef[],
    ): Promise<void> {
        const resolvedPermissions = await this.resolvePermissions(permissions);

        const rows = resolvedPermissions.map((permission) => {
            return {
                role_id,
                permission: permission.name,
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

    async unlinkUserGroups(userId: number): Promise<void> {
        return this.db(T.GROUP_USER)
            .where({
                user_id: userId,
            })
            .delete();
    }

    async clearUserPersonalAccessTokens(userId: number): Promise<void> {
        return this.db(T.PERSONAL_ACCESS_TOKENS)
            .where({
                user_id: userId,
            })
            .delete();
    }

    async clearPublicSignupUserTokens(userId: number): Promise<void> {
        return this.db(T.PUBLIC_SIGNUP_TOKENS_USER)
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
            roleId,
            addedAt: r.created_at,
        }));
    }

    async getProjectUsers(
        projectId?: string,
    ): Promise<IUserWithProjectRoles[]> {
        const rows = await this.db
            .select(['user_id', 'ru.created_at', 'ru.role_id'])
            .from<IRole>(`${T.ROLE_USER} AS ru`)
            .join(`${T.ROLES} as r`, 'ru.role_id', 'id')
            .whereIn('r.type', PROJECT_ROLE_TYPES)
            .andWhere('ru.project', projectId);

        return rows.reduce((acc, row) => {
            const existingUser = acc.find((user) => user.id === row.user_id);

            if (existingUser) {
                existingUser.roles.push(row.role_id);
            } else {
                acc.push({
                    id: row.user_id,
                    addedAt: row.created_at,
                    roleId: row.role_id,
                    roles: [row.role_id],
                });
            }

            return acc;
        }, []);
    }

    async getRolesForUserId(userId: number): Promise<IRoleWithProject[]> {
        return this.db
            .select(['id', 'name', 'type', 'project', 'description'])
            .from<IRole[]>(T.ROLES)
            .innerJoin(`${T.ROLE_USER} as ru`, 'ru.role_id', 'id')
            .where('ru.user_id', '=', userId);
    }

    async getAllProjectRolesForUser(
        userId: number,
        project: string,
    ): Promise<IRoleWithProject[]> {
        const stopTimer = this.timer('get_all_project_roles_for_user');
        const roles = await this.db
            .select(['id', 'name', 'type', 'project', 'description'])
            .from<IRole[]>(T.ROLES)
            .innerJoin(`${T.ROLE_USER} as ru`, 'ru.role_id', 'id')
            .where('ru.user_id', '=', userId)
            .andWhere((builder) => {
                builder
                    .where('ru.project', '=', project)
                    .orWhere('type', '=', 'root');
            })
            .union([
                this.db
                    .select(['id', 'name', 'type', 'project', 'description'])
                    .from<IRole[]>(T.ROLES)
                    .innerJoin(`${T.GROUP_ROLE} as gr`, 'gr.role_id', 'id')
                    .innerJoin(
                        `${T.GROUP_USER} as gu`,
                        'gu.group_id',
                        'gr.group_id',
                    )
                    .where('gu.user_id', '=', userId)
                    .andWhere((builder) => {
                        builder
                            .where('gr.project', '=', project)
                            .orWhere('type', '=', 'root');
                    }),
            ]);
        stopTimer();
        return roles;
    }

    async getRootRoleForUser(userId: number): Promise<IRole | undefined> {
        return this.db
            .select(['id', 'name', 'type', 'description'])
            .from<IRole[]>(T.ROLES)
            .innerJoin(`${T.ROLE_USER} as ru`, 'ru.role_id', 'id')
            .whereIn('type', ROOT_ROLE_TYPES)
            .andWhere('ru.user_id', '=', userId)
            .first();
    }

    async getUserIdsForRole(roleId: number): Promise<number[]> {
        const rows = await this.db
            .select(['user_id'])
            .from<IRole>(T.ROLE_USER)
            .where('role_id', roleId);
        return rows.map((r) => r.user_id);
    }

    async getGroupIdsForRole(roleId: number): Promise<number[]> {
        const rows = await this.db
            .select(['group_id'])
            .from<IRole>(T.GROUP_ROLE)
            .where('role_id', roleId);
        return rows.map((r) => r.group_id);
    }

    async getProjectUserAndGroupCountsForRole(
        roleId: number,
    ): Promise<IProjectRoleUsage[]> {
        const query = await this.db.raw(
            `
            SELECT
                uq.project,
                sum(uq.user_count) AS user_count,
                sum(uq.svc_account_count) AS svc_account_count,
                sum(uq.group_count) AS group_count
            FROM (
                SELECT
                    project,
                    0 AS user_count,
                    0 AS svc_account_count,
                    count(project) AS group_count
                FROM group_role
                WHERE role_id = ?
                GROUP BY project

                UNION SELECT
                    project,
                    count(us.id) AS user_count,
                    count(svc.id) AS svc_account_count,
                    0 AS group_count
                FROM role_user AS usr_r
                LEFT OUTER JOIN public.users AS us ON us.id = usr_r.user_id AND us.is_service = 'false'
                LEFT OUTER JOIN public.users AS svc ON svc.id = usr_r.user_id AND svc.is_service = 'true'
                WHERE usr_r.role_id = ?
                GROUP BY usr_r.project
            ) AS uq
            GROUP BY uq.project
        `,
            [roleId, roleId],
        );

        return query.rows.map((r) => {
            return {
                project: r.project,
                role: roleId,
                userCount: Number(r.user_count),
                groupCount: Number(r.group_count),
                serviceAccountCount: Number(r.svc_account_count),
            };
        });
    }

    async addUserToRole(
        userId: number,
        roleId: number,
        projectId?: string,
    ): Promise<void> {
        await this.db(T.ROLE_USER)
            .insert({
                user_id: userId,
                role_id: roleId,
                project: projectId,
            })
            .onConflict(['user_id', 'role_id', 'project'])
            .ignore();
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

    async addAccessToProject(
        roles: number[],
        groups: number[],
        users: number[],
        projectId: string,
        createdBy: string,
    ): Promise<void> {
        const validatedProjectRoleIds = await this.db(T.ROLES)
            .select('id')
            .whereIn('id', roles)
            .whereIn('type', PROJECT_ROLE_TYPES)
            .pluck('id');

        if (validatedProjectRoleIds.length !== roles.length) {
            const invalidRoles = roles.filter(
                (role) => !validatedProjectRoleIds.includes(role),
            );

            throw new BadDataError(
                `You can't add access to a project with roles that aren't project roles or that don't exist. These roles are not valid: ${invalidRoles.join(
                    ', ',
                )}`,
            );
        }

        const groupRows = groups.flatMap((group) =>
            validatedProjectRoleIds.map((role) => ({
                group_id: group,
                project: projectId,
                role_id: role,
                created_by: createdBy,
            })),
        );

        const userRows = users.flatMap((user) =>
            validatedProjectRoleIds.map((role) => ({
                user_id: user,
                project: projectId,
                role_id: role,
            })),
        );

        await inTransaction(this.db, async (tx) => {
            const errors: string[] = [];
            if (groupRows.length > 0) {
                await tx(T.GROUP_ROLE)
                    .insert(groupRows)
                    .onConflict(['project', 'role_id', 'group_id'])
                    .merge()
                    .catch((err) => {
                        if (
                            err.message.includes(
                                `violates foreign key constraint "group_role_group_id_fkey"`,
                            )
                        ) {
                            errors.push(
                                `Your request contains one or more group IDs that do not exist. You sent these group IDs: ${groups.join(
                                    ', ',
                                )}.`,
                            );
                        }
                    });
            }
            if (userRows.length > 0) {
                await tx(T.ROLE_USER)
                    .insert(userRows)
                    .onConflict(['project', 'role_id', 'user_id'])
                    .merge()
                    .catch((err) => {
                        if (
                            err.message.includes(
                                `violates foreign key constraint "role_user_user_id_fkey"`,
                            )
                        ) {
                            errors.push(
                                `Your request contains one or more user IDs that do not exist. You sent these user IDs: ${users.join(
                                    ', ',
                                )}.`,
                            );
                        }
                    });
            }

            if (errors.length) {
                const mapped = errors.map((message) => ({
                    message,
                }));

                // because TS doesn't understand that the non-empty
                // array is guaranteed to have at least one element
                throw new BadDataError('', [mapped[0], ...mapped.slice(1)]);
            }
        });
    }

    async setProjectRolesForUser(
        projectId: string,
        userId: number,
        roles: number[],
    ): Promise<void> {
        const projectRoleIds = await this.db(T.ROLES)
            .select('id')
            .whereIn('type', PROJECT_ROLE_TYPES)
            .pluck('id');

        const projectRoleIdsSet = new Set(projectRoleIds);

        const userRows = roles
            .filter((role) => projectRoleIdsSet.has(role))
            .map((role) => ({
                user_id: userId,
                project: projectId,
                role_id: role,
            }));

        await inTransaction(this.db, async (tx) => {
            await tx(T.ROLE_USER)
                .where('project', projectId)
                .andWhere('user_id', userId)
                .whereIn('role_id', projectRoleIds)
                .delete();

            if (userRows.length > 0) {
                await tx(T.ROLE_USER)
                    .insert(userRows)
                    .onConflict(['project', 'role_id', 'user_id'])
                    .ignore();
            }
        });
    }

    async getProjectRolesForUser(
        projectId: string,
        userId: number,
    ): Promise<number[]> {
        const rows = await this.db(`${T.ROLE_USER} as ru`)
            .join(`${T.ROLES} as r`, 'ru.role_id', 'r.id')
            .select('ru.role_id')
            .where('ru.project', projectId)
            .whereIn('r.type', PROJECT_ROLE_TYPES)
            .andWhere('ru.user_id', userId);
        return rows.map((r) => r.role_id as number);
    }

    async setProjectRolesForGroup(
        projectId: string,
        groupId: number,
        roles: number[],
        createdBy: string,
    ): Promise<void> {
        const projectRoleIds = await this.db(T.ROLES)
            .select('id')
            .whereIn('type', PROJECT_ROLE_TYPES)
            .pluck('id');

        const projectRoleIdsSet = new Set(projectRoleIds);

        const groupRows = roles
            .filter((role) => projectRoleIdsSet.has(role))
            .map((role) => ({
                group_id: groupId,
                project: projectId,
                role_id: role,
                created_by: createdBy,
            }));

        await inTransaction(this.db, async (tx) => {
            await tx(T.GROUP_ROLE)
                .where('project', projectId)
                .andWhere('group_id', groupId)
                .whereIn('role_id', projectRoleIds)
                .delete();
            if (groupRows.length > 0) {
                await tx(T.GROUP_ROLE)
                    .insert(groupRows)
                    .onConflict(['project', 'role_id', 'group_id'])
                    .ignore();
            }
        });
    }

    async getProjectRolesForGroup(
        projectId: string,
        groupId: number,
    ): Promise<number[]> {
        const rows = await this.db(`${T.GROUP_ROLE} as gr`)
            .join(`${T.ROLES} as r`, 'gr.role_id', 'r.id')
            .select('gr.role_id')
            .where('gr.project', projectId)
            .whereIn('r.type', PROJECT_ROLE_TYPES)
            .andWhere('gr.group_id', groupId);
        return rows.map((row) => row.role_id as number);
    }

    async removeUserAccess(projectId: string, userId: number): Promise<void> {
        return this.db(T.ROLE_USER)
            .where({
                user_id: userId,
                project: projectId,
            })
            .whereIn(
                'role_id',
                this.db(T.ROLES)
                    .select('id as role_id')
                    .whereIn('type', PROJECT_ROLE_TYPES),
            )
            .delete();
    }

    async removeGroupAccess(projectId: string, groupId: number): Promise<void> {
        return this.db(T.GROUP_ROLE)
            .where({
                group_id: groupId,
                project: projectId,
            })
            .whereIn(
                'role_id',
                this.db(T.ROLES)
                    .select('id as role_id')
                    .whereIn('type', PROJECT_ROLE_TYPES),
            )
            .delete();
    }

    async removeRolesOfTypeForUser(
        userId: number,
        roleTypes: string[],
    ): Promise<void> {
        const rolesToRemove = await this.db(T.ROLES)
            .select('id')
            .whereIn('type', roleTypes)
            .pluck('id');

        return this.db(T.ROLE_USER)
            .where({ user_id: userId })
            .whereIn('role_id', rolesToRemove)
            .delete();
    }

    async addPermissionsToRole(
        role_id: number,
        permissions: PermissionRef[] | string[],
        environment?: string,
    ): Promise<void> {
        const permissionsAsRefs = (permissions ?? []).map((p) => {
            if (typeof p === 'string') {
                return { name: p };
            } else {
                return p;
            }
        });
        // no need to pass down the environment in this particular case because it'll be overriden
        const permissionsWithNames =
            await this.resolvePermissions(permissionsAsRefs);

        const newRoles = permissionsWithNames.map((p) => ({
            role_id,
            environment,
            permission: p.name,
        }));

        return this.db.batchInsert(T.ROLE_PERMISSION, newRoles);
    }

    async removePermissionFromRole(
        role_id: number,
        permission: string,
        environment?: string,
    ): Promise<void> {
        return this.db(T.ROLE_PERMISSION)
            .where({
                role_id,
                permission,
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

    async cloneEnvironmentPermissions(
        sourceEnvironment: string,
        destinationEnvironment: string,
    ): Promise<void> {
        return this.db.raw(
            `insert into role_permission
                (role_id, permission, environment)
                (select role_id, permission, ?
                from ${T.ROLE_PERMISSION} where environment = ?)`,
            [destinationEnvironment, sourceEnvironment],
        );
    }

    async getUserAccessOverview(): Promise<IUserAccessOverview[]> {
        const result =
            await this.db.raw(`SELECT u.id, u.created_at, u.name, u.email, u.seen_at, up.p_array as projects, gr.p_array as groups, gp.p_array as group_projects, r.name as root_role
                FROM users u, LATERAL (
                SELECT ARRAY (
                    SELECT ru.project
                    FROM   role_user ru
                    WHERE  ru.user_id = u.id
                    ) AS p_array
                ) up, LATERAL (
                    SELECT r.name
                    FROM   role_user ru
                    INNER JOIN roles r on ru.role_id = r.id
                    WHERE ru.user_id = u.id and r.type IN (${ROOT_ROLE_TYPES.map(
                        (type) => `'${type}'`,
                    ).join(',')})
                ) r, LATERAL (
                SELECT ARRAY (
                    SELECT g.name FROM group_user gu
                    JOIN groups g on g.id = gu.group_id
                    WHERE  gu.user_id = u.id
                    ) AS p_array
                ) gr, LATERAL (
                SELECT ARRAY (
                    SELECT  gr.project
                        FROM group_user gu
                        JOIN group_role gr ON gu.group_id = gr.group_id
                    WHERE gu.user_id = u.id
                    )
                    AS p_array
                ) gp

                order by u.id;`);
        return result.rows.map((row) => {
            return {
                userId: row.id,
                createdAt: row.created_at,
                userName: row.name,
                userEmail: row.email,
                lastSeen: row.seen_at,
                accessibleProjects: row.projects,
                groups: row.groups,
                rootRole: row.root_role,
                groupProjects: row.group_projects,
            };
        });
    }
}
