import { IAccount } from '../../lib/types';
import { IAccountStore } from '../../lib/types/stores/account-store';

export class FakeAccountStore implements IAccountStore {
    data: IAccount[];

    idSeq: number;

    constructor() {
        this.idSeq = 1;
        this.data = [];
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        return this.data.some((u) => u.id === key);
    }

    async get(key: number): Promise<IAccount> {
        return this.data.find((u) => u.id === key);
    }

    async getAll(): Promise<IAccount[]> {
        return Promise.resolve(this.data);
    }

    async delete(id: number): Promise<void> {
        this.data = this.data.filter((item) => item.id !== id);
        return Promise.resolve();
    }

    async getAllWithId(): Promise<IAccount[]> {
        throw new Error('Not implemented');
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAccountByPersonalAccessToken(secret: string): Promise<IAccount> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async markSeenAt(secrets: string[]): Promise<void> {
        throw new Error('Not implemented');
    }
}
