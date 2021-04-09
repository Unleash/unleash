/* eslint camelcase: "off" */

import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import User from '../user';

const NotFoundError = require('../error/notfound-error');

const TABLE = 'users';

const USER_COLUMNS = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'permissions', // TODO: remove in v4
    'login_attempts',
    'seen_at',
    'created_at',
];

const USER_COLUMNS_PUBLIC = ['id', 'name', 'username', 'email', 'image_url'];

const emptify = value => {
    if (!value) {
        return undefined;
    }
    return value;
};

const mapUserToColumns = user => ({
    name: user.name,
    username: user.username,
    email: user.email,
    image_url: user.imageUrl,
    permissions: user.permissions ? JSON.stringify(user.permissions) : null,
});

const rowToUser = row => {
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
        permissions: row.permissions,
        seenAt: row.seen_at,
        createdAt: row.created_at,
    });
};

export interface IUserLookup {
    id?: number;
    username?: string;
    email?: string;
}

export interface IUserSearch {
    name?: string;
    username?: string;
    email: string;
}

export interface IUserUpdateFields {
    name?: string;
    email?: string;
}

class UserStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('user-store.js');
    }

    async update(id: number, fields: IUserUpdateFields): Promise<User> {
        await this.db(TABLE)
            .where('id', id)
            .update(mapUserToColumns(fields));
        return this.get({ id });
    }

    async insert(user: User): Promise<User> {
        const rows = await this.db(TABLE)
            .insert(mapUserToColumns(user))
            .returning(USER_COLUMNS);
        return rowToUser(rows[0]);
    }

    async upsert(user: User): Promise<User> {
        const id = await this.hasUser(user);

        if (id) {
            return this.update(id, user);
        }
        return this.insert(user);
    }

    buildSelectUser(q: IUserLookup): any {
        const query = this.db(TABLE);
        if (q.id) {
            return query.where('id', q.id);
        }
        if (q.email) {
            return query.where('email', q.email);
        }
        if (q.username) {
            return query.where('username', q.username);
        }
        throw new Error('Can only find users with id, username or email.');
    }

    async hasUser(idQuery: IUserLookup): Promise<number | undefined> {
        const query = this.buildSelectUser(idQuery);
        const item = await query.first('id');
        return item ? item.id : undefined;
    }

    async getAll(): Promise<User[]> {
        const users = await this.db.select(USER_COLUMNS).from(TABLE);
        return users.map(rowToUser);
    }

    async search(query: IUserSearch): Promise<User[]> {
        const users = await this.db
            .select(USER_COLUMNS_PUBLIC)
            .from(TABLE)
            .where('name', 'ILIKE', `%${query}%`)
            .orWhere('username', 'ILIKE', `${query}%`)
            .orWhere('email', 'ILIKE', `${query}%`);
        return users.map(rowToUser);
    }

    async getAllWithId(userIdList: number[]): Promise<User[]> {
        const users = await this.db
            .select(USER_COLUMNS_PUBLIC)
            .from(TABLE)
            .whereIn('id', userIdList);
        return users.map(rowToUser);
    }

    async get(idQuery: IUserLookup): Promise<User> {
        const row = await this.buildSelectUser(idQuery).first(USER_COLUMNS);
        return rowToUser(row);
    }

    async delete(id: number): Promise<void> {
        return this.db(TABLE)
            .where({ id })
            .del();
    }

    async getPasswordHash(userId: number): Promise<string> {
        const item = await this.db(TABLE)
            .where('id', userId)
            .first('password_hash');

        if (!item) {
            throw new NotFoundError('User not found');
        }

        return item.password_hash;
    }

    async setPasswordHash(userId: number, passwordHash: string): Promise<void> {
        return this.db(TABLE)
            .where('id', userId)
            .update({
                password_hash: passwordHash,
            });
    }

    async incLoginAttempts(user: User): Promise<void> {
        return this.buildSelectUser(user).increment('login_attempts', 1);
    }

    async successfullyLogin(user: User): Promise<void> {
        return this.buildSelectUser(user).update({
            login_attempts: 0,
            seen_at: new Date(),
        });
    }
}

module.exports = UserStore;
export default UserStore;
