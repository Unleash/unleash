/* eslint camelcase: "off" */

import type { Logger, LogProvider } from '../logger';
import User from '../types/user';

import NotFoundError from '../error/notfound-error';
import type {
    ICreateUser,
    IUserLookup,
    IUserStore,
    IUserUpdateFields,
} from '../types/stores/user-store';
import type { Db } from './db';
import type { IFlagResolver } from '../types';

const TABLE = 'users';
const PASSWORD_HASH_TABLE = 'used_passwords';

const USER_COLUMNS_PUBLIC = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'seen_at',
    'is_service',
    'scim_id',
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
        scimId: row.scim_id,
    });
};

class UserStore implements IUserStore {
    private db: Db;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    constructor(db: Db, getLogger: LogProvider, flagResolver: IFlagResolver) {
        this.db = db;
        this.logger = getLogger('user-store.ts');
        this.flagResolver = flagResolver;
    }

    async getPasswordsPreviouslyUsed(userId: number): Promise<string[]> {
        const previouslyUsedPasswords = await this.db(PASSWORD_HASH_TABLE)
            .select('password_hash')
            .where({ user_id: userId });
        return previouslyUsedPasswords.map((row) => row.password_hash);
    }

    async deletePasswordsUsedMoreThanNTimesAgo(
        userId: number,
        keepLastN: number,
    ): Promise<void> {
        await this.db.raw(
            `
            WITH UserPasswords AS (
                SELECT user_id, password_hash, used_at, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY used_at DESC) AS rn
            FROM ${PASSWORD_HASH_TABLE}
            WHERE user_id = ?)
            DELETE FROM ${PASSWORD_HASH_TABLE} WHERE user_id = ? AND (user_id, password_hash, used_at) NOT IN (SELECT user_id, password_hash, used_at FROM UserPasswords WHERE rn <= ?
            );
        `,
            [userId, userId, keepLastN],
        );
    }

    async update(id: number, fields: IUserUpdateFields): Promise<User> {
        await this.activeUsers()
            .where('id', id)
            .update(mapUserToColumns(fields));
        return this.get(id);
    }

    async insert(user: ICreateUser): Promise<User> {
        const rows = await this.db(TABLE)
            .insert({ ...mapUserToColumns(user), created_at: new Date() })
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
        const query = this.activeAll();
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

    activeAll(): any {
        return this.db(TABLE).where({
            deleted_at: null,
        });
    }

    activeUsers(): any {
        return this.db(TABLE).where({
            deleted_at: null,
            is_service: false,
            is_system: false,
        });
    }

    async hasUser(idQuery: IUserLookup): Promise<number | undefined> {
        const query = this.buildSelectUser(idQuery);
        const item = await query.first('id');
        return item ? item.id : undefined;
    }

    async getAll(): Promise<User[]> {
        const users = await this.activeUsers().select(USER_COLUMNS);
        return users.map(rowToUser);
    }

    async search(query: string): Promise<User[]> {
        const users = await this.activeUsers()
            .select(USER_COLUMNS_PUBLIC)
            .where('name', 'ILIKE', `%${query}%`)
            .orWhere('username', 'ILIKE', `${query}%`)
            .orWhere('email', 'ILIKE', `${query}%`);
        return users.map(rowToUser);
    }

    async getAllWithId(userIdList: number[]): Promise<User[]> {
        const users = await this.activeUsers()
            .select(USER_COLUMNS_PUBLIC)
            .whereIn('id', userIdList);
        return users.map(rowToUser);
    }

    async getByQuery(idQuery: IUserLookup): Promise<User> {
        const row = await this.buildSelectUser(idQuery).first(USER_COLUMNS);
        return rowToUser(row);
    }

    async delete(id: number): Promise<void> {
        return this.activeUsers()
            .where({ id })
            .update({
                deleted_at: new Date(),
                email: null,
                username: null,
                name: this.db.raw('name || ?', '(Deleted)'),
            });
    }

    async getPasswordHash(userId: number): Promise<string> {
        const item = await this.activeUsers()
            .where('id', userId)
            .first('password_hash');

        if (!item) {
            throw new NotFoundError('User not found');
        }

        return item.password_hash;
    }

    async setPasswordHash(
        userId: number,
        passwordHash: string,
        disallowNPreviousPasswords: number,
    ): Promise<void> {
        await this.activeUsers().where('id', userId).update({
            password_hash: passwordHash,
        });
        // We apparently set this to null, but you should be allowed to have null, so need to allow this
        if (passwordHash) {
            await this.db(PASSWORD_HASH_TABLE).insert({
                user_id: userId,
                password_hash: passwordHash,
            });
            await this.deletePasswordsUsedMoreThanNTimesAgo(
                userId,
                disallowNPreviousPasswords,
            );
        }
    }

    async incLoginAttempts(user: User): Promise<void> {
        return this.buildSelectUser(user).increment('login_attempts', 1);
    }

    async successfullyLogin(user: User): Promise<void> {
        const currentDate = new Date();
        const updateQuery = this.buildSelectUser(user).update({
            login_attempts: 0,
            seen_at: currentDate,
        });
        if (this.flagResolver.isEnabled('onboardingMetrics')) {
            updateQuery.update({
                first_seen_at: this.db.raw('COALESCE(first_seen_at, ?)', [
                    currentDate,
                ]),
            });
        }
        return updateQuery;
    }

    async deleteAll(): Promise<void> {
        await this.activeUsers().del();
    }

    async count(): Promise<number> {
        return this.activeUsers()
            .count('*')
            .then((res) => Number(res[0].count));
    }

    async countServiceAccounts(): Promise<number> {
        return this.db(TABLE)
            .where({
                deleted_at: null,
                is_service: true,
            })
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
        const row = await this.activeUsers().where({ id }).first();
        return rowToUser(row);
    }
}

module.exports = UserStore;
export default UserStore;
