import User, { IUser } from '../../lib/types/user';
import {
    ICreateUser,
    IUserLookup,
    IUserStore,
} from '../../lib/types/stores/user-store';

class UserStoreMock implements IUserStore {
    data: IUser[];

    idSeq: number;

    constructor() {
        this.idSeq = 1;
        this.data = [];
    }

    async hasUser({
        id,
        username,
        email,
    }: IUserLookup): Promise<number | undefined> {
        const user = this.data.find((i) => {
            if (id && i.id === id) return true;
            if (username && i.username === username) return true;
            if (email && i.email === email) return true;
            return false;
        });
        if (user) {
            return user.id;
        }
        return undefined;
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        return this.data.some((u) => u.id === key);
    }

    async count(): Promise<number> {
        return this.data.length;
    }

    async get(key: number): Promise<IUser> {
        return this.data.find((u) => u.id === key);
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
        this.data = this.data.map((o) => {
            if (o.id === id) return { ...o, name: user.name };
            return o;
        });
        return Promise.resolve(user);
    }

    async getByQuery({ id, username, email }: IUserLookup): Promise<IUser> {
        const user = this.data.find((i) => {
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

    async getAll(): Promise<IUser[]> {
        return Promise.resolve(this.data);
    }

    async setPasswordHash(userId: number, passwordHash: string): Promise<void> {
        const u = this.data.find((a) => a.id === userId);
        // @ts-expect-error
        u.passwordHash = passwordHash;
        return Promise.resolve();
    }

    async getPasswordHash(id: number): Promise<string> {
        const u = this.data.find((i) => i.id === id);
        // @ts-expect-error
        return Promise.resolve(u.passwordHash);
    }

    async delete(id: number): Promise<void> {
        this.data = this.data.filter((item) => item.id !== id);
        return Promise.resolve();
    }

    async successfullyLogin(user: User): Promise<void> {
        if (!this.exists(user.id)) {
            throw new Error('No such user');
        }
    }

    buildSelectUser(): any {
        throw new Error('Not implemented');
    }

    async search(): Promise<IUser[]> {
        throw new Error('Not implemented');
    }

    async getAllWithId(): Promise<IUser[]> {
        throw new Error('Not implemented');
    }

    async incLoginAttempts(): Promise<void> {
        throw new Error('Not implemented');
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    upsert(user: ICreateUser): Promise<IUser> {
        this.data.splice(this.data.findIndex((u) => u.email === user.email));
        this.data.push({
            id: this.data.length + 1,
            createdAt: new Date(),
            isAPI: false,
            permissions: [],
            loginAttempts: 0,
            imageUrl: '',
            ...user,
        });
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUserByPersonalAccessToken(secret: string): Promise<IUser> {
        return Promise.resolve(undefined);
    }
}

module.exports = UserStoreMock;

export default UserStoreMock;
