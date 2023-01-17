/* eslint camelcase: "off" */

import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import User from '../types/user';

import NotFoundError from '../error/notfound-error';
import {
    ICreateUser,
    IUserLookup,
    IUserUpdateFields,
} from '../types/stores/user-store';
import { IAccountStore } from '../types';

const TABLE = 'users';

const USER_COLUMNS_PUBLIC = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'seen_at',
    'is_service',
];

const USER_COLUMNS = [...USER_COLUMNS_PUBLIC, 'login_attempts', 'created_at'];

const emptify = (value) => {
    if (!value) {
        return undefined;
    }
    return value;
};

const safeToLower = (s?: string) => (s ? s.toLowerCase() : s);

const mapUserToColumns = (user: ICreateUser) => ({
    name: user.name,
    username: user.username,
    email: safeToLower(user.email),
    image_url: user.imageUrl,
});

const rowToUser = (row) => {
    if (!row) {
        throw new NotFoundError('No user found');
    }
    return new User({
        id: row.id,
        name: emptify(row.name),
        username: emptify(row.username),
        email: emptify(row.email),
        imageUrl: emptify(row.image_url),
        loginAttempts: row.login_attempts,
        seenAt: row.seen_at,
        createdAt: row.created_at,
        isService: row.is_service,
    });
};

export class AccountStore implements IAccountStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('account-store.ts');
    }

    async update(id: number, fields: IUserUpdateFields): Promise<User> {
        await this.activeAccounts()
            .where('id', id)
            .update(mapUserToColumns(fields));
        return this.get(id);
    }

    async insert(user: ICreateUser): Promise<User> {
        const rows = await this.db(TABLE)
            .insert(mapUserToColumns(user))
            .returning(USER_COLUMNS);
        return rowToUser(rows[0]);
    }

    async upsert(user: ICreateUser): Promise<User> {
        const id = await this.hasAccount(user);

        if (id) {
            return this.update(id, user);
        }
        return this.insert(user);
    }

    buildSelectAccount(q: IUserLookup): any {
        const query = this.activeAccounts();
        if (q.id) {
            return query.where('id', q.id);
        }
        if (q.email) {
            return query.where('email', safeToLower(q.email));
        }
        if (q.username) {
            return query.where('username', q.username);
        }
        throw new Error('Can only find users with id, username or email.');
    }

    activeAccounts(): any {
        return this.db(TABLE).where({
            deleted_at: null,
        });
    }

    async hasAccount(idQuery: IUserLookup): Promise<number | undefined> {
        const query = this.buildSelectAccount(idQuery);
        const item = await query.first('id');
        return item ? item.id : undefined;
    }

    async getAll(): Promise<User[]> {
        const users = await this.activeAccounts().select(USER_COLUMNS);
        return users.map(rowToUser);
    }

    async search(query: string): Promise<User[]> {
        const users = await this.activeAccounts()
            .select(USER_COLUMNS_PUBLIC)
            .where('name', 'ILIKE', `%${query}%`)
            .orWhere('username', 'ILIKE', `${query}%`)
            .orWhere('email', 'ILIKE', `${query}%`);
        return users.map(rowToUser);
    }

    async getAllWithId(userIdList: number[]): Promise<User[]> {
        const users = await this.activeAccounts()
            .select(USER_COLUMNS_PUBLIC)
            .whereIn('id', userIdList);
        return users.map(rowToUser);
    }

    async getByQuery(idQuery: IUserLookup): Promise<User> {
        const row = await this.buildSelectAccount(idQuery).first(USER_COLUMNS);
        return rowToUser(row);
    }

    async delete(id: number): Promise<void> {
        return this.activeAccounts()
            .where({ id })
            .update({
                deleted_at: new Date(),
                email: null,
                username: null,
                name: this.db.raw('name || ?', '(Deleted)'),
            });
    }

    async deleteAll(): Promise<void> {
        await this.activeAccounts().del();
    }

    async count(): Promise<number> {
        return this.activeAccounts()
            .count('*')
            .then((res) => Number(res[0].count));
    }

    destroy(): void {}

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ? and deleted_at = null) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(id: number): Promise<User> {
        const row = await this.activeAccounts().where({ id }).first();
        return rowToUser(row);
    }

    async getAccountByPersonalAccessToken(secret: string): Promise<User> {
        const row = await this.activeAccounts()
            .select(USER_COLUMNS.map((column) => `${TABLE}.${column}`))
            .leftJoin(
                'personal_access_tokens',
                'personal_access_tokens.user_id',
                `${TABLE}.id`,
            )
            .where('secret', secret)
            .andWhere('expires_at', '>', 'now()')
            .first();
        return rowToUser(row);
    }

    async markSeenAt(secrets: string[]): Promise<void> {
        const now = new Date();
        try {
            await this.db('personal_access_tokens')
                .whereIn('secret', secrets)
                .update({ seen_at: now });
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }
}
