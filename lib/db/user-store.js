/* eslint camelcase: "off" */

'use strict';

const NotFoundError = require('../error/notfound-error');
const User = require('../user');

const TABLE = 'users';

const USER_COLUMNS = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'permissions',
    'login_attempts',
    'seen_at',
    'created_at',
];

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

class UserStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('user-store.js');
    }

    async update(id, user) {
        await this.db(TABLE)
            .where('id', id)
            .update(mapUserToColumns(user));
        return this.get({ id });
    }

    async insert(user) {
        const [id] = await this.db(TABLE)
            .insert(mapUserToColumns(user))
            .returning('id');
        return this.get({ id });
    }

    buildSelectUser(q) {
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

    async hasUser(idQuery) {
        const query = this.buildSelectUser(idQuery);
        const item = await query.first('id');
        return item ? item.id : undefined;
    }

    async upsert(user) {
        const id = await this.hasUser(user);

        if (id) {
            return this.update(id, user);
        }
        return this.insert(user);
    }

    async getAll() {
        const users = await this.db.select(USER_COLUMNS).from(TABLE);
        return users.map(rowToUser);
    }

    async get(idQuery) {
        const row = await this.buildSelectUser(idQuery).first(USER_COLUMNS);
        return rowToUser(row);
    }

    async delete(id) {
        return this.db(TABLE)
            .where({ id })
            .del();
    }

    async getPasswordHash(userId) {
        const item = await this.db(TABLE)
            .where('id', userId)
            .first('password_hash');

        if (!item) {
            throw new NotFoundError('User not found');
        }

        return item.password_hash;
    }

    async setPasswordHash(userId, passwordHash) {
        return this.db(TABLE)
            .where('id', userId)
            .update({
                password_hash: passwordHash,
            });
    }

    async incLoginAttempts(user) {
        return this.buildSelectUser(user).increment({
            login_attempts: 1,
        });
    }

    async succesfullLogin(user) {
        return this.buildSelectUser(user).update({
            login_attempts: 0,
            seen_at: new Date(),
        });
    }
}

module.exports = UserStore;
