import { IGroupStore, IStoreGroup } from '../types/stores/group-store';
import { Knex } from 'knex';
import NotFoundError from '../error/notfound-error';
import Group, {
    IGroup,
    IGroupModel,
    IGroupProject,
    IGroupRole,
    IGroupUser,
    IGroupUserModel,
} from '../types/group';
import Transaction = Knex.Transaction;

const T = {
    GROUPS: 'groups',
    GROUP_USER: 'group_user',
    GROUP_ROLE: 'group_role',
    USERS: 'users',
    PROJECTS: 'projects',
    ROLES: 'roles',
};

const GROUP_COLUMNS = ['id', 'name', 'description', 'created_at', 'created_by'];

const rowToGroup = (row) => {
    if (!row) {
        throw new NotFoundError('No group found');
    }
    return new Group({
        id: row.id,
        name: row.name,
        description: row.description,
        createdAt: row.created_at,
        createdBy: row.created_by,
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
    };
};

const groupToRow = (user: IStoreGroup) => ({
    name: user.name,
    description: user.description,
});

export default class GroupStore implements IGroupStore {
    private db: Knex;

    constructor(db: Knex) {
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
        const rows = await this.db(T.GROUPS)
            .where({ id: group.id })
            .update({
                name: group.name,
                description: group.description,
            })
            .returning(GROUP_COLUMNS);

        return rowToGroup(rows[0]);
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
            .select('gu.group_id', 'u.id as user_id', 'gu.created_at')
            .from(`${T.GROUP_USER} AS gu`)
            .join(`${T.USERS} AS u`, 'u.id', 'gu.user_id')
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
        const row = await this.db(T.GROUPS)
            .insert(groupToRow(group))
            .returning('*');
        return rowToGroup(row[0]);
    }

    async addNewUsersToGroup(
        groupId: number,
        users: IGroupUserModel[],
        userName: string,
        transaction?: Transaction,
    ): Promise<void> {
        const rows = users.map((user) => {
            return {
                group_id: groupId,
                user_id: user.user.id,
                created_by: userName,
            };
        });
        return (transaction || this.db).batchInsert(T.GROUP_USER, rows);
    }

    async deleteOldUsersFromGroup(
        deletableUsers: IGroupUser[],
        transaction?: Transaction,
    ): Promise<void> {
        return (transaction || this.db)(T.GROUP_USER)
            .whereIn(
                ['group_id', 'user_id'],
                deletableUsers.map((user) => [user.groupId, user.userId]),
            )
            .delete();
    }

    async updateGroupUsers(
        groupId: number,
        newUsers: IGroupUserModel[],
        existingUsers: IGroupUserModel[],
        deletableUsers: IGroupUser[],
        userName: string,
    ): Promise<void> {
        await this.db.transaction(async (tx) => {
            await this.addNewUsersToGroup(groupId, newUsers, userName, tx);
            await this.deleteOldUsersFromGroup(deletableUsers, tx);
        });
    }
}
