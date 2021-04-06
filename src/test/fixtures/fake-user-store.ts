/* eslint-disable import/no-named-as-default */
import UserStore, { IUserLookup } from '../../lib/db/user-store';
import User from '../../lib/user';
import noLoggerProvider from './no-logger';

class UserStoreMock extends UserStore {
    data: any[];

    idSeq: number;

    constructor() {
        super(undefined, noLoggerProvider);
        this.idSeq = 1;
        this.data = [];
    }

    async hasUser({
        id,
        username,
        email,
    }: IUserLookup): Promise<number | undefined> {
        const user = this.data.find(i => {
            if (id && i.id === id) return true;
            if (username && i.username === username) return true;
            if (email && i.email === email) return true;
            return false;
        });
        return user;
    }

    async insert(user: User): Promise<User> {
        // eslint-disable-next-line no-param-reassign
        user.id = this.idSeq;
        this.idSeq += 1;
        this.data.push(user);
        return Promise.resolve(user);
    }

    async update(id: number, user: User): Promise<User> {
        // eslint-disable-next-line no-param-reassign
        this.data = this.data.map(o => {
            if (o.id === id) return { ...o, name: user.name };
            return o;
        });
        return Promise.resolve(user);
    }

    async get({ id, username, email }: IUserLookup): Promise<User> {
        const user = this.data.find(i => {
            if (i.id && i.id === id) return true;
            if (i.username && i.username === username) return true;
            if (i.email && i.email === email) return true;
            return false;
        });
        if (user) {
            return user;
        }
        throw new Error('Could not find user');
    }

    async getAll(): Promise<User[]> {
        return Promise.resolve(this.data);
    }

    async setPasswordHash(userId: number, passwordHash: string): Promise<void> {
        const u = this.data.find(a => a.id === userId);
        u.passwordHash = passwordHash;
        return Promise.resolve();
    }

    async getPasswordHash(id: number): Promise<string> {
        const u = this.data.find(i => i.id === id);
        return Promise.resolve(u.passwordHash);
    }

    async delete(id: number): Promise<void> {
        this.data = this.data.filter(item => item.id !== id);
        return Promise.resolve();
    }

    async successfullyLogin(user: User): Promise<void> {
        const u = this.data.find(i => i.id === user.id);
        u.login_attempts = 0;
        u.seen_at = new Date();
        return Promise.resolve();
    }

    buildSelectUser(): any {
        throw new Error('Not implemented');
    }

    async search(): Promise<User[]> {
        throw new Error('Not implemented');
    }

    async getAllWithId(): Promise<User[]> {
        throw new Error('Not implemented');
    }

    async incLoginAttempts(): Promise<void> {
        throw new Error('Not implemented');
    }
}

module.exports = UserStoreMock;

export default UserStoreMock;
