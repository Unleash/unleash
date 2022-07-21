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
};

const GROUP_COLUMNS = ['id', 'name', 'description', 'created_at', 'created_by'];
const GROUP_ROLE_COLUMNS = ['group_id', 'role_id', 'created_at'];

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
        role: row.role,
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
            .select(GROUP_ROLE_COLUMNS)
            .from(`${T.GROUP_ROLE}`)
            .where('project', projectId);
        return rows.map((r) => {
            return {
                groupId: r.group_id,
                roleId: r.role_id,
                createdAt: r.created_at,
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
            .select('gu.group_id', 'u.id as user_id', 'role', 'gu.created_at')
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
                role: user.role,
                created_by: userName,
            };
        });
        return (transaction || this.db).batchInsert(T.GROUP_USER, rows);
    }

    async updateExistingUsersInGroup(
        groupId: number,
        existingUsers: IGroupUserModel[],
        transaction?: Transaction,
    ): Promise<void> {
        const queries = [];

        existingUsers.forEach((user) => {
            queries.push(
                (transaction || this.db)(T.GROUP_USER)
                    .where({ group_id: groupId, user_id: user.user.id })
                    .update({ role: user.role })
                    .transacting(transaction),
            );
        });

        await Promise.all(queries);
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
            await this.updateExistingUsersInGroup(groupId, existingUsers, tx);
            await this.deleteOldUsersFromGroup(deletableUsers, tx);
        });
    }
}
