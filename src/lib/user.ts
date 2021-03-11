import gravatarUrl from 'gravatar-url';
import Joi from 'joi';

export interface UserData {
    id?: number;
    isAPI?: boolean;
    name?: string;
    username?: string;
    email?: string;
    permissions?: string[];
    imageUrl?: string;
    seenAt?: Date;
    loginAttempts?: number;
    createdAt?: Date;
}

export default class User {
    id: number;

    isAPI: boolean;

    name: string;

    username: string;

    email: string;

    permissions: string[];

    imageUrl: string;

    seenAt: Date;

    loginAttempts: number;

    createdAt: Date;

    constructor(
        {
            id,
            isAPI,
            name,
            email,
            username,
            imageUrl,
            permissions,
            seenAt,
            loginAttempts,
            createdAt,
        }: UserData = { isAPI: false },
    ) {
        if (!username && !email) {
            throw new TypeError('Username or Email is required');
        }
        Joi.assert(email, Joi.string().email(), 'Email');
        Joi.assert(username, Joi.string(), 'Username');
        Joi.assert(name, Joi.string(), 'Name');

        this.id = id;
        this.isAPI = isAPI;
        this.name = name;
        this.username = username;
        this.email = email;
        this.permissions = permissions;
        this.imageUrl = imageUrl || this.generateImageUrl();
        this.seenAt = seenAt;
        this.loginAttempts = loginAttempts;
        this.createdAt = createdAt;
    }

    generateImageUrl(): string {
        return gravatarUrl(this.email || this.username, {
            size: 42,
            default: 'retro',
        });
    }
}

module.exports = User;
