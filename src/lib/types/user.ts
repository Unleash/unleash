import Joi from 'joi';
import { generateImageUrl } from '../util/generateImageUrl';

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
    seenAt?: Date;
    createdAt: Date;
    permissions?: string[];
    loginAttempts?: number;
    isAPI?: boolean;
    imageUrl: string;
}

export interface IProjectUser extends IUser {
    addedAt: Date;
}

export default class User implements IUser {
    isAPI: boolean = false;

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
        return generateImageUrl(this);
    }
}

module.exports = User;
