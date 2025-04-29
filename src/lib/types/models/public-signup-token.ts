import type User from '../user.js';

export interface IPublicSignupTokenCreate {
    name: string;
    expiresAt: Date;
    roleId: number;
    secret: string;
    createdBy: string;
    url: string;
}

export interface IPublicSignupToken extends IPublicSignupTokenCreate {
    users: User[];
}
