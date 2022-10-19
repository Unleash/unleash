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

export interface IUserStore extends Store<IUser, number> {
    update(id: number, fields: IUserUpdateFields): Promise<IUser>;
    insert(user: ICreateUser): Promise<IUser>;
    upsert(user: ICreateUser): Promise<IUser>;
    hasUser(idQuery: IUserLookup): Promise<number | undefined>;
    search(query: string): Promise<IUser[]>;
    getAllWithId(userIdList: number[]): Promise<IUser[]>;
    getByQuery(idQuery: IUserLookup): Promise<IUser>;
    getPasswordHash(userId: number): Promise<string>;
    setPasswordHash(userId: number, passwordHash: string): Promise<void>;
    incLoginAttempts(user: IUser): Promise<void>;
    successfullyLogin(user: IUser): Promise<void>;
    count(): Promise<number>;
    getUserByPersonalAccessToken(secret: string): Promise<IUser>;
}
