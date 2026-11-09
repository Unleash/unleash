import type { IUser, MinimalUser } from '../user.js';
import type { Store } from './store.js';

export type AccountTokenReference =
    | { version: 'v1'; secret: string }
    | { version: 'v2'; selector: string };

export interface AccountTokenWithVerifier {
    account: IUser;
    verifier: string;
}

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
    getAccountByPersonalAccessToken(secret: string): Promise<IUser | undefined>;
    getAccountByTokenSelector(
        selector: string,
    ): Promise<AccountTokenWithVerifier | undefined>;
    markSeenAt(tokens: AccountTokenReference[]): Promise<void>;
    getAdminCount(): Promise<IAdminCount>;
    getAdmins(): Promise<MinimalUser[]>;
}
