import type { IGroupStore, IStoreGroup } from '../types/stores/group-store.js';
import NotFoundError from '../error/notfound-error.js';
import Group, {
    type ICreateGroupUserModel,
    type IGroup,
    type IGroupModel,
    type IGroupProject,
    type IGroupRole,
    type IGroupUser,
} from '../types/group.js';
import type { Db } from './db.js';
import { BadDataError, FOREIGN_KEY_VIOLATION } from '../error/index.js';
import type { IGroupWithProjectRoles } from '../types/stores/access-store.js';
import { PROJECT_ROLE_TYPES } from '../util/index.js';

const T = {
    GROUPS: 'groups',
    GROUP_USER: 'group_user',
    GROUP_ROLE: 'group_role',
    USERS: 'users',
    PROJECTS: 'projects',
    ROLES: 'roles',
};

const GROUP_COLUMNS = [
    'id',
    'name',
    'description',
    'mappings_sso',
    'created_at',
    'created_by',
    'root_role_id',
    'scim_id',
];

export const SSO_SYNC_USER = 'SSO';

const rowToGroup = (row) => {
    if (!row) {
        throw new NotFoundError('No group found');
    }
    return new Group({
        id: row.id,
        name: row.name,
        description: row.description,
        mappingsSSO: row.mappings_sso,
        createdAt: row.created_at,
        createdBy: row.created_by,
        rootRole: row.root_role_id,
        scimId: row.scim_id,
    });
};

const rowToGroupUser = (row) => {
    if (!row) {
        throw new NotFoundError('No group user found');
    }
    return {
        userId: row.user_id,
        groupId: row.group_id,
        joinedAt: row.created_at,
        createdBy: row.created_by,
        rootRoleId: row.root_role_id,
    };
};

const groupToRow = (group: IStoreGroup) => ({
    name: group.name,
    description: group.description,
    mappings_sso: JSON.stringify(group.mappingsSSO),
    root_role_id: group.rootRole || null,
});

export default class GroupStore implements IGroupStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getAllWithId(ids: number[]): Promise<Group[]> {
        const groups = await this.db
            .select(GROUP_COLUMNS)
            .from(T.GROUPS)
            .whereIn('id', ids);
        return groups.map(rowToGroup);
    }

    async update(group: IGroupModel): Promise<IGroup> {
        try {
            const rows = await this.db(T.GROUPS)
                .where({ id: group.id })
                .update(groupToRow(group))
                .returning(GROUP_COLUMNS);

            return rowToGroup(rows[0]);
        } catch (error) {
            if (
                error.code === FOREIGN_KEY_VIOLATION &&
                error.constraint === 'fk_group_role_id'
            ) {
                throw new BadDataError(`Incorrect role id ${group.rootRole}`);
            }
            throw error;
        }
    }

    async getProjectGroupRoles(projectId: string): Promise<IGroupRole[]> {
        const rows = await this.db
            .select('gr.group_id', 'gr.role_id', 'gr.created_at', 'r.name')
            .from(`${T.GROUP_ROLE} as gr`)
            .innerJoin(`${T.ROLES} as r`, 'gr.role_id', 'r.id')
            .where('project', projectId);

        return rows.map((r) => {
            return {
                groupId: r.group_id,
                roleId: r.role_id,
                createdAt: r.created_at,
                name: r.name,
            };
        });
    }

    async getProjectGroups(
        projectId: string,
    ): Promise<IGroupWithProjectRoles[]> {
        const rows = await this.db
            .select(['gr.group_id', 'gr.created_at', 'gr.role_id'])
            .from(`${T.GROUP_ROLE} AS gr`)
            .join(`${T.ROLES} as r`, 'gr.role_id', 'r.id')
            .whereIn('r.type', PROJECT_ROLE_TYPES)
            .andWhere('project', projectId);

        return rows.reduce((acc, row) => {
            const existingGroup = acc.find(
                (group) => group.id === row.group_id,
            );

            if (existingGroup) {
                existingGroup.roles.push(row.role_id);
            } else {
                acc.push({
                    id: row.group_id,
                    addedAt: row.created_at,
                    roleId: row.role_id,
                    roles: [row.role_id],
                });
            }

            return acc;
        }, []);
    }

    async getGroupProjects(groupIds: number[]): Promise<IGroupProject[]> {
        const rows = await this.db
            .select('group_id', 'project')
            .from(T.GROUP_ROLE)
            .whereIn('group_id', groupIds)
            .distinct();
        return rows.map((r) => {
            return {
                groupId: r.group_id,
                project: r.project,
            };
        });
    }

    async getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]> {
        const rows = await this.db
            .select(
                'gu.group_id',
                'u.id as user_id',
                'gu.created_at',
                'gu.created_by',
                'g.root_role_id',
            )
            .from(`${T.GROUP_USER} AS gu`)
            .join(`${T.USERS} AS u`, 'u.id', 'gu.user_id')
            .join(`${T.GROUPS} AS g`, 'g.id', 'gu.group_id')
            .whereIn('gu.group_id', groupIds);
        return rows.map(rowToGroupUser);
    }

    async getAll(): Promise<Group[]> {
        const groups = await this.db.select(GROUP_COLUMNS).from(T.GROUPS);
        return groups.map(rowToGroup);
    }

    async delete(id: number): Promise<void> {
        return this.db(T.GROUPS).where({ id }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(T.GROUPS).del();
    }

    destroy(): void {}

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${T.GROUPS} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async existsWithName(name: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${T.GROUPS} WHERE name = ?) AS present`,
            [name],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(id: number): Promise<Group> {
        const row = await this.db(T.GROUPS).where({ id }).first();
        return rowToGroup(row);
    }

    async create(group: IStoreGroup): Promise<Group> {
        try {
            const row = await this.db(T.GROUPS)
                .insert(groupToRow(group))
                .returning('*');
            return rowToGroup(row[0]);
        } catch (error) {
            if (
                error.code === FOREIGN_KEY_VIOLATION &&
                error.constraint === 'fk_group_role_id'
            ) {
                throw new BadDataError(`Incorrect role id ${group.rootRole}`);
            }
            throw error;
        }
    }

    async count(): Promise<number> {
        return this.db(T.GROUPS)
            .count('*')
            .then((res) => Number(res[0].count));
    }

    async addUsersToGroup(
        groupId: number,
        users: ICreateGroupUserModel[],
        userName: string,
    ): Promise<void> {
        try {
            const rows = (users || []).map((user) => {
                return {
                    group_id: groupId,
                    user_id: user.user.id,
                    created_by: userName,
                };
            });
            return await this.db.batchInsert(T.GROUP_USER, rows);
        } catch (error) {
            if (
                error.code === FOREIGN_KEY_VIOLATION &&
                error.constraint === 'group_user_user_id_fkey'
            ) {
                throw new BadDataError('Incorrect user id in the users group');
            }
            throw error;
        }
    }

    async deleteUsersFromGroup(deletableUsers: IGroupUser[]): Promise<void> {
        return this.db(T.GROUP_USER)
            .whereIn(
                ['group_id', 'user_id'],
                deletableUsers.map((user) => [user.groupId, user.userId]),
            )
            .delete();
    }

    async updateGroupUsers(
        groupId: number,
        newUsers: ICreateGroupUserModel[],
        deletableUsers: IGroupUser[],
        userName: string,
    ): Promise<void> {
        await this.addUsersToGroup(groupId, newUsers, userName);
        await this.deleteUsersFromGroup(deletableUsers);
    }

    async getNewGroupsForExternalUser(
        userId: number,
        externalGroups: string[],
    ): Promise<IGroup[]> {
        const rows = await this.db(`${T.GROUPS} as g`)
            .leftJoin(`${T.GROUP_USER} as gs`, function () {
                this.on('g.id', 'gs.group_id').andOnVal(
                    'gs.user_id',
                    '=',
                    userId,
                );
            })
            .where('gs.user_id', null)
            .whereRaw('mappings_sso \\?| :groups', { groups: externalGroups });
        return rows.map(rowToGroup);
    }

    async addUserToGroups(
        userId: number,
        groupIds: number[],
        createdBy?: string,
    ): Promise<void> {
        const rows = groupIds.map((groupId) => {
            return {
                group_id: groupId,
                user_id: userId,
                created_by: createdBy,
            };
        });
        return this.db.batchInsert(T.GROUP_USER, rows);
    }

    async getOldGroupsForExternalUser(
        userId: number,
        externalGroups: string[],
    ): Promise<IGroupUser[]> {
        const rows = await this.db(`${T.GROUP_USER} as gu`)
            .leftJoin(`${T.GROUPS} as g`, 'g.id', 'gu.group_id')
            .whereNotIn(
                'g.id',
                this.db(T.GROUPS)
                    .select('id')
                    .whereRaw('mappings_sso \\?| :groups', {
                        groups: externalGroups,
                    })
                    .orWhereRaw('jsonb_array_length(mappings_sso) = 0'),
            )
            .where({ 'gu.user_id': userId, 'gu.created_by': SSO_SYNC_USER });

        return rows.map(rowToGroupUser);
    }

    async getGroupsForUser(userId: number): Promise<Group[]> {
        const rows = await this.db(T.GROUPS)
            .leftJoin(T.GROUP_USER, 'groups.id', 'group_user.group_id')
            .where('user_id', userId);
        return rows.map(rowToGroup);
    }

    async hasProjectRole(groupId: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${T.GROUP_ROLE} WHERE group_id = ?) AS present`,
            [groupId],
        );
        const { present } = result.rows[0];
        return present;
    }

    async deleteScimGroups(): Promise<void> {
        await this.db(T.GROUPS).whereNotNull('scim_id').del();
    }
}
