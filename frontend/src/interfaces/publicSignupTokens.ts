import type { IRole } from './role.js';
import type { IUser } from './user.js';

export interface ICreateInvitedUser {
    username?: string;
    email: string;
    name: string;
    password: string;
}

export interface IPublicSignupTokens {
    tokens: IPublicSignupToken[];
}

export interface IPublicSignupToken {
    secret: string;
    url: string;
    name: string;
    enabled: boolean;
    expiresAt: string;
    createdAt: string;
    createdBy: string | null;
    users?: IUser[] | null;
    role: IRole;
}

export interface IPublicSignupTokenCreate {
    name: string;
    expiresAt: string;
}

export interface IPublicSignupTokenUpdate {
    expiresAt?: string;
    enabled?: boolean;
}
