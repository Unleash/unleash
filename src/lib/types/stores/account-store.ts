import { IAccount } from '../account';
import { Store } from './store';

export interface IAccountStore extends Store<IAccount, number> {
    getAllWithId(userIdList: number[]): Promise<IAccount[]>;
    getAccountByPersonalAccessToken(secret: string): Promise<IAccount>;
    markSeenAt(secrets: string[]): Promise<void>;
}
