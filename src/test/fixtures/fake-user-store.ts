import type User from '../../lib/types/user.js';
import type { IUser } from '../../lib/types/user.js';
import type {
    ICreateUser,
    IUserLookup,
    IUserStore,
} from '../../lib/types/stores/user-store.js';

class UserStoreMock implements IUserStore {
    data: IUser[];
    previousPasswords: Map<number, string[]>;
    idSeq: number;

    constructor() {
        this.idSeq = 1;
        this.data = [];
        this.previousPasswords = new Map();
    }

    async getFirstUserDate(): Promise<Date | null> {
        if (this.data.length === 0) {
            return null;
        }
        const oldestUser = this.data.reduce((oldest, user) => {
            if (!user.createdAt) {
                return oldest;
            }
            return !oldest.createdAt || user.createdAt < oldest.createdAt
                ? user
                : oldest;
        }, this.data[0]);

        return oldestUser.createdAt || null;
    }

    getPasswordsPreviouslyUsed(userId: number): Promise<string[]> {
        return Promise.resolve(this.previousPasswords.get(userId) || []);
    }
    countServiceAccounts(): Promise<number> {
        return Promise.resolve(0);
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

    async countRecentlyDeleted(): Promise<number> {
        return Promise.resolve(0);
    }

    async get(key: number): Promise<IUser> {
        return this.data.find((u) => u.id === key)!;
    }

    async insert(user: User): Promise<User> {
        user.id = this.idSeq;
        this.idSeq += 1;
        this.data.push(user);
        return Promise.resolve(user);
    }

    async update(id: number, user: User): Promise<User> {
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
        const previousPasswords = this.previousPasswords.get(userId) || [];
        previousPasswords.push(passwordHash);
        this.previousPasswords.set(userId, previousPasswords.slice(1, 6));
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

    async successfullyLogin(user: User): Promise<number> {
        if (!this.exists(user.id)) {
            throw new Error('No such user');
        }
        return 0;
    }

    buildSelectUser(): any {
        throw new Error('Not implemented');
    }

    async search(): Promise<IUser[]> {
        throw new Error('Not implemented');
    }

    async getAllUsers(): Promise<IUser[]> {
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

    deleteScimUsers(): Promise<User[]> {
        throw new Error('Method not implemented.');
    }

    upsert(user: ICreateUser): Promise<IUser> {
        this.data.splice(this.data.findIndex((u) => u.email === user.email));
        const userToReturn = {
            id: this.data.length + 1,
            createdAt: new Date(),
            isAPI: false,
            permissions: [],
            loginAttempts: 0,
            imageUrl: '',
            name: user.name ?? '',
            username: user.username ?? '',
            email: user.email ?? '',
            ...user,
        };
        this.data.push(userToReturn);
        return Promise.resolve(userToReturn);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUserByPersonalAccessToken(_secret: string): Promise<IUser> {
        throw new Error('Not implemented');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async markSeenAt(_secrets: string[]): Promise<void> {
        throw new Error('Not implemented');
    }
}

export default UserStoreMock;
