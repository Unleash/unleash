import { Store } from './store';

export enum ApiTokenType {
    CLIENT = 'client',
    ADMIN = 'admin',
}

export interface IApiTokenCreate {
    secret: string;
    username: string;
    type: ApiTokenType;
    expiresAt?: Date;
}

export interface IApiToken extends IApiTokenCreate {
    createdAt: Date;
    seenAt?: Date;
}

export interface IApiTokenStore extends Store<IApiToken, string> {
    getAllActive(): Promise<IApiToken[]>;
    insert(newToken: IApiTokenCreate): Promise<IApiToken>;
    setExpiry(secret: string, expiresAt: Date): Promise<IApiToken>;
    markSeenAt(secrets: string[]): Promise<void>;
}
