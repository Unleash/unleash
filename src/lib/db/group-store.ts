import { IGroupStore, IStoreGroup } from '../types/stores/group-store';
import { Knex } from 'knex';
import NotFoundError from '../error/notfound-error';
import Group, { IGroupUser, IGroupUserModel } from '../types/group';

const T = {
    GROUPS: 'groups',
    GROUP_USER: 'group_user',
    USERS: 'users',
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
        type: row.type,
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

    async getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]> {
        const rows = await this.db
            .select('gu.group_id', 'u.id as user_id', 'type')
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
            `SELECT EXISTS (SELECT 1 FROM ${T.GROUPS} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async existsWithName(name: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.GROUPS} WHERE name = ?) AS present`,
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

    async addUsersToGroup(
        id: number,
        users: IGroupUserModel[],
        userName: string,
    ): Promise<void> {
        const rows = users.map((user) => {
            return {
                group_id: id,
                user_id: user.user.id,
                type: user.type,
                created_by: userName,
            };
        });
        return this.db.batchInsert(T.GROUP_USER, rows);
    }
}
