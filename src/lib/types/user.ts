import Joi, { ValidationError } from 'joi';
import { generateImageUrl } from '../util/generateImageUrl';

export const AccountTypes = ['User', 'Service Account'] as const;
type AccountType = (typeof AccountTypes)[number];

export interface UserData {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    imageUrl?: string;
    seenAt?: Date;
    loginAttempts?: number;
    createdAt?: Date;
    isService?: boolean;
    scimId?: string;
}

export interface IUser {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    inviteLink?: string;
    seenAt?: Date;
    createdAt?: Date;
    permissions: string[];
    loginAttempts?: number;
    isAPI: boolean;
    imageUrl?: string;
    accountType?: AccountType;
    scimId?: string;
}

export interface IProjectUser extends IUser {
    addedAt: Date;
}

export interface IAuditUser {
    id: number;
    username: string;
    ip: string;
}

export default class User implements IUser {
    isAPI: boolean = false;

    id: number;

    name: string;

    username: string;

    email: string;

    permissions: string[];

    imageUrl: string;

    seenAt?: Date;

    loginAttempts?: number;

    createdAt?: Date;

    accountType?: AccountType = 'User';

    scimId?: string;

    constructor({
        id,
        name,
        email,
        username,
        imageUrl,
        seenAt,
        loginAttempts,
        createdAt,
        isService,
        scimId,
    }: UserData) {
        if (!id) {
            throw new ValidationError('Id is required', [], undefined);
        }
        Joi.assert(email, Joi.string().email({ ignoreLength: true }), 'Email');
        Joi.assert(username, Joi.string(), 'Username');
        Joi.assert(name, Joi.string(), 'Name');

        this.id = id;
        this.name = name!;
        this.username = username!;
        this.email = email!;
        this.imageUrl = imageUrl || this.generateImageUrl();
        this.seenAt = seenAt;
        this.loginAttempts = loginAttempts;
        this.createdAt = createdAt;
        this.accountType = isService ? 'Service Account' : 'User';
        this.scimId = scimId;
    }

    generateImageUrl(): string {
        return generateImageUrl(this);
    }
}

export interface IUserWithRootRole extends IUser {
    rootRole: number;
}

module.exports = User;
