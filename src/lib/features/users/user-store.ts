import type { LogProvider } from '../../logger.js';
import User from '../../types/user.js';

import NotFoundError from '../../error/notfound-error.js';
import type {
    ICreateUser,
    IUserLookup,
    IUserStore,
    IUserUpdateFields,
} from '../../types/stores/user-store.js';
import type { Db } from '../../db/db.js';
import type { Knex } from 'knex';

const TABLE = 'users';
export const USERS_TABLE = TABLE;
const PASSWORD_HASH_TABLE = 'used_passwords';

export const USER_COLUMNS_PUBLIC = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'seen_at',
    'is_service',
    'scim_id',
    'seat_type',
    'company_role',
    'product_updates_email_consent',
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
    company_role: user.companyRole,
    product_updates_email_consent: user.productUpdatesEmailConsent,
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
        seatType: row.seat_type,
        companyRole: row.company_role,
        productUpdatesEmailConsent: row.product_updates_email_consent,
    });
};

export class UserStore implements IUserStore {
    private db: Db;

    constructor(db: Db, _getLogger: LogProvider) {
        this.db = db;
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
        const emailHash = user.email
            ? this.db.raw(`encode(sha256(?::bytea), 'hex')`, [user.email])
            : null;
        const rows = await this.db(TABLE)
            .insert({
                ...mapUserToColumns(user),
                email_hash: emailHash,
                created_at: new Date(),
            })
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

    buildSelectUser(q: IUserLookup): Knex.QueryBuilder<User> {
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

    activeAll(): Knex.QueryBuilder<User> {
        return this.db(TABLE).where({
            deleted_at: null,
        });
    }

    activeUsers(): Knex.QueryBuilder<User> {
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

    async getAll(params?: {
        limit: number;
        offset: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<User[]> {
        const usersQuery = this.activeUsers().select(USER_COLUMNS);
        if (params) {
            if (params.sortBy) {
                usersQuery.orderBy(params.sortBy, params.sortOrder);
            }
            if (params.limit) {
                usersQuery.limit(params.limit);
            }
            if (params.offset) {
                usersQuery.offset(params.offset);
            }
        }
        return (await usersQuery).map(rowToUser);
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
        await this.activeUsers()
            .where({ id })
            .update({
                deleted_at: new Date(),
                // @ts-expect-error email is non-nullable in User type
                email: null,
                // @ts-expect-error username is non-nullable in User type
                username: null,
                scim_id: null,
                scim_external_id: null,
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
            // @ts-expect-error password_hash does not exist in User type
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
        await this.buildSelectUser(user).increment('login_attempts', 1);
    }

    async successfullyLogin(user: User): Promise<number> {
        const currentDate = new Date();
        const updateQuery = this.buildSelectUser(user).update({
            // @ts-expect-error login_attempts does not exist in User type
            login_attempts: 0,
            seen_at: currentDate,
        });

        let firstLoginOrder = 0;

        const existingUser =
            await this.buildSelectUser(user).first('first_seen_at');

        if (!existingUser.first_seen_at) {
            const countEarlierUsers = await this.db(TABLE)
                .whereNotNull('first_seen_at')
                .andWhere('first_seen_at', '<', currentDate)
                .count('*')
                .then((res) => Number(res[0].count));

            firstLoginOrder = countEarlierUsers;

            await updateQuery.update({
                // @ts-expect-error first_seen_at does not exist in User type
                first_seen_at: currentDate,
            });
        }

        await updateQuery;
        return firstLoginOrder;
    }

    async deleteAll(): Promise<void> {
        await this.activeUsers().del();
    }

    async deleteScimUsers(): Promise<User[]> {
        const rows = await this.db(TABLE)
            .whereNotNull('scim_id')
            .del()
            .returning(USER_COLUMNS);
        return rows.map(rowToUser);
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

    async countRecentlyDeleted(): Promise<number> {
        return this.db(TABLE)
            .whereNotNull('deleted_at')
            .andWhere(
                'deleted_at',
                '>=',
                this.db.raw(`NOW() - INTERVAL '1 month'`),
            )
            .andWhere({ is_service: false, is_system: false })
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

    async getFirstUserDate(): Promise<Date | null> {
        const firstInstanceUser = await this.db(TABLE)
            .select('created_at')
            .where('is_system', '=', false)
            .orderBy('created_at', 'asc')
            .first();

        return firstInstanceUser ? firstInstanceUser.created_at : null;
    }
}
