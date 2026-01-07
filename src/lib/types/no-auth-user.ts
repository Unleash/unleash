import { ADMIN } from './permissions.js';
import type { IUser } from './user.js';
export default class NoAuthUser implements IUser {
    isAPI: boolean;

    username: string;

    id: number;

    permissions: string[];

    name: string;
    email: string;
    inviteLink?: string | undefined;
    seenAt?: Date | undefined;
    createdAt?: Date | undefined;
    loginAttempts?: number | undefined;
    imageUrl: string;
    accountType?: 'User' | 'Service Account' | undefined;

    constructor(
        username: string = 'unknown',
        id: number = -1,
        permissions: string[] = [ADMIN],
    ) {
        this.isAPI = true;
        this.username = username;
        this.name = 'unknown';
        this.id = id;
        this.permissions = permissions;
    }
}
