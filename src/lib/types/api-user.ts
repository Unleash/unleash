import type { ApiTokenType } from './model.js';
import pkg from 'joi';
const { ValidationError } = pkg;

import { CLIENT } from './permissions.js';

export interface IApiUserData {
    permissions?: string[];
    projects?: string[];
    project?: string;
    environment: string;
    type: ApiTokenType;
    secret: string;
    tokenName: string;
}

export interface IApiUser {
    internalAdminTokenUserId?: number; // user associated to an admin token
    username: string;
    permissions: string[];
    projects: string[];
    environment: string;
    type: ApiTokenType;
    secret: string;
}

export class ApiUser implements IApiUser {
    readonly isAPI: boolean = true;

    readonly permissions: string[];

    readonly projects: string[];

    readonly environment: string;

    readonly type: ApiTokenType;

    readonly secret: string;

    readonly username: string;

    constructor({
        permissions = [CLIENT],
        projects,
        project,
        environment,
        type,
        secret,
        tokenName,
    }: IApiUserData) {
        if (!tokenName) {
            throw new ValidationError('tokenName is required', [], undefined);
        }
        this.username = tokenName;
        this.permissions = permissions;
        this.environment = environment;
        this.type = type;
        this.secret = secret;
        if (projects && projects.length > 0) {
            this.projects = projects;
        } else {
            this.projects = project ? [project] : [];
        }
    }
}

export default ApiUser;
