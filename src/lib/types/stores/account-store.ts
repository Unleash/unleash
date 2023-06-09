import { IUser } from '../user';
import { Store } from './store';

export interface IUserLookup {
    id?: number;
    username?: string;
    email?: string;
}

export interface IAdminCount {
    password: number;
    noPassword: number;
    service: number;
}

export interface IAccountStore extends Store<IUser, number> {
    hasAccount(idQuery: IUserLookup): Promise<number | undefined>;
    search(query: string): Promise<IUser[]>;
    getAllWithId(userIdList: number[]): Promise<IUser[]>;
    getByQuery(idQuery: IUserLookup): Promise<IUser>;
    count(): Promise<number>;
    getAccountByPersonalAccessToken(secret: string): Promise<IUser>;
    markSeenAt(secrets: string[]): Promise<void>;
    getAdminCount(): Promise<IAdminCount>;
}
