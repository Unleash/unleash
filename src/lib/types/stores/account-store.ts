import { IUser } from '../user';
import { Store } from './store';

export interface ICreateUser {
    name?: string;
    username?: string;
    email?: string;
    imageUrl?: string;
}

export interface IUserLookup {
    id?: number;
    username?: string;
    email?: string;
}

export interface IUserUpdateFields {
    name?: string;
    email?: string;
}

export interface IAccountStore extends Store<IUser, number> {
    update(id: number, fields: IUserUpdateFields): Promise<IUser>;
    insert(user: ICreateUser): Promise<IUser>;
    upsert(user: ICreateUser): Promise<IUser>;
    hasAccount(idQuery: IUserLookup): Promise<number | undefined>;
    search(query: string): Promise<IUser[]>;
    getAllWithId(userIdList: number[]): Promise<IUser[]>;
    getByQuery(idQuery: IUserLookup): Promise<IUser>;
    count(): Promise<number>;
    getAccountByPersonalAccessToken(secret: string): Promise<IUser>;
    markSeenAt(secrets: string[]): Promise<void>;
}
