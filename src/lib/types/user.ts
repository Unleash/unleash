import Joi from 'joi';
const { ValidationError } = Joi;
import { generateImageUrl } from '../util/generateImageUrl.js';
import type { AccountTypes } from '../events/index.js';

type AccountType = (typeof AccountTypes)[number];

export const SeatTypes = ['Regular', 'ReadOnly'] as const;
type SeatType = (typeof SeatTypes)[number];

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
    seatType?: SeatType;
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
    seatType?: SeatType;
    deletedSessions?: number;
    activeSessions?: number;
}

export type MinimalUser = Pick<
    IUser,
    'id' | 'name' | 'username' | 'email' | 'imageUrl'
>;

export interface IProjectUser extends IUser {
    addedAt: Date;
}

export interface IAuditUser {
    id: number;
    username: string;
    ip: string;
}

export class User implements IUser {
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

    seatType?: SeatType = 'Regular';

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
        seatType,
    }: UserData) {
        if (!id) {
            throw new ValidationError('Id is required', [], undefined);
        }

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
        this.seatType = seatType || 'Regular';
    }

    generateImageUrl(): string {
        return generateImageUrl(this);
    }
}

export interface IUserWithRootRole extends IUser {
    rootRole: number;
}

export default User;
