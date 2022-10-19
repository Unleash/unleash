/* eslint camelcase: "off" */

import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import User from '../types/user';

import NotFoundError from '../error/notfound-error';
import {
    ICreateUser,
    IUserLookup,
    IUserStore,
    IUserUpdateFields,
} from '../types/stores/user-store';

const TABLE = 'users';

const USER_COLUMNS = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'login_attempts',
    'seen_at',
    'created_at',
];

const USER_COLUMNS_PUBLIC = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'seen_at',
];

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
    });
};

class UserStore implements IUserStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('user-store.ts');
    }

    async update(id: number, fields: IUserUpdateFields): Promise<User> {
        await this.db(TABLE).where('id', id).update(mapUserToColumns(fields));
        return this.get(id);
    }

    async insert(user: ICreateUser): Promise<User> {
        const rows = await this.db(TABLE)
            .insert(mapUserToColumns(user))
            .returning(USER_COLUMNS);
        return rowToUser(rows[0]);
    }

    async upsert(user: ICreateUser): Promise<User> {
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
            return query.where('email', safeToLower(q.email));
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

    async search(query: string): Promise<User[]> {
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

    async getByQuery(idQuery: IUserLookup): Promise<User> {
        const row = await this.buildSelectUser(idQuery).first(USER_COLUMNS);
        return rowToUser(row);
    }

    async delete(id: number): Promise<void> {
        return this.db(TABLE).where({ id }).del();
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
        return this.db(TABLE).where('id', userId).update({
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

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    async count(): Promise<number> {
        return this.db
            .from(TABLE)
            .count('*')
            .then((res) => Number(res[0].count));
    }

    destroy(): void {}

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(id: number): Promise<User> {
        const row = await this.db(TABLE).where({ id }).first();
        return rowToUser(row);
    }

    async getUserByPersonalAccessToken(secret: string): Promise<User> {
        const row = await this.db
            .select(USER_COLUMNS.map((column) => `${TABLE}.${column}`))
            .from(TABLE)
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
}

module.exports = UserStore;
export default UserStore;
