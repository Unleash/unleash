import type { IUser, MinimalUser } from '../../lib/types/user.js';
import type {
    IAdminCount,
    IAccountStore,
    IUserLookup,
    AccountTokenReference,
    AccountTokenWithVerifier,
} from '../../lib/types/stores/account-store.js';

export class FakeAccountStore implements IAccountStore {
    data: IUser[];

    admins: MinimalUser[];

    idSeq: number;

    constructor() {
        this.idSeq = 1;
        this.data = [];
        this.admins = [];
    }
    async hasAccount({
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

    async get(key: number): Promise<IUser | undefined> {
        return this.data.find((u) => u.id === key);
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

    async delete(id: number): Promise<void> {
        this.data = this.data.filter((item) => item.id !== id);
        return Promise.resolve();
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

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAccountByPersonalAccessToken(
        _secret: string,
    ): Promise<IUser | undefined> {
        return Promise.resolve(undefined);
    }

    getAccountByTokenSelector(
        _selector: string,
    ): Promise<AccountTokenWithVerifier | undefined> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async markSeenAt(_tokens: AccountTokenReference[]): Promise<void> {
        throw new Error('Not implemented');
    }

    async getAdminCount(): Promise<IAdminCount> {
        throw new Error('Not implemented');
    }

    setAdmins(admins: MinimalUser[]): void {
        this.admins = admins;
    }

    async getAdmins(): Promise<MinimalUser[]> {
        return this.admins;
    }
}
