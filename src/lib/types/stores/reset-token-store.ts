import { Store } from './store';

export interface IResetTokenCreate {
    reset_token: string;
    user_id: number;
    expires_at: Date;
    created_by?: string;
}

export interface IResetToken {
    userId: number;
    token: string;
    createdBy: string;
    expiresAt: Date;
    createdAt: Date;
    usedAt?: Date;
}

export interface IResetQuery {
    userId: number;
    token: string;
}

export interface IResetTokenQuery {
    user_id: number;
    reset_token: string;
}

export interface IResetTokenStore extends Store<IResetToken, string> {
    getActive(token: string): Promise<IResetToken>;
    getActiveTokens(): Promise<IResetToken[]>;
    insert(newToken: IResetTokenCreate): Promise<IResetToken>;
    useToken(token: IResetQuery): Promise<boolean>;
    deleteFromQuery(query: IResetTokenQuery): Promise<void>;
    deleteExpired(): Promise<void>;
    expireExistingTokensForUser(user_id: number): Promise<void>;
}
