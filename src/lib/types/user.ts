import gravatarUrl from 'gravatar-url';
import Joi from 'joi';

export interface UserData {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    imageUrl?: string;
    seenAt?: Date;
    loginAttempts?: number;
    createdAt?: Date;
}

export interface IUser {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    inviteLink?: string;
    createdAt: Date;
}

export default class User implements IUser {
    id: number;

    name: string;

    username: string;

    email: string;

    permissions: string[];

    imageUrl: string;

    seenAt: Date;

    loginAttempts: number;

    createdAt: Date;

    constructor({
        id,
        name,
        email,
        username,
        imageUrl,
        seenAt,
        loginAttempts,
        createdAt,
    }: UserData) {
        if (!id) {
            throw new TypeError('Id is required');
        }
        if (!username && !email) {
            throw new TypeError('Username or Email is required');
        }
        Joi.assert(email, Joi.string().email(), 'Email');
        Joi.assert(username, Joi.string(), 'Username');
        Joi.assert(name, Joi.string(), 'Name');

        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
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
