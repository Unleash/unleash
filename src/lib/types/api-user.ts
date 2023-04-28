import { ApiTokenType } from './models/api-token';
import { ValidationError } from 'joi';

import { CLIENT } from './permissions';

interface IApiUserData {
    username?: string;
    permissions?: string[];
    projects?: string[];
    project?: string;
    environment: string;
    type: ApiTokenType;
    secret: string;
    tokenName: string;
}

export default class ApiUser {
    readonly isAPI: boolean = true;

    readonly username: string;

    readonly permissions: string[];

    readonly projects: string[];

    readonly environment: string;

    readonly type: ApiTokenType;

    readonly secret: string;

    constructor({
        username,
        permissions = [CLIENT],
        projects,
        project,
        environment,
        type,
        secret,
    }: IApiUserData) {
        if (!username) {
            throw new ValidationError('username is required', [], undefined);
        }
        this.username = username;
        this.permissions = permissions;
        this.environment = environment;
        this.type = type;
        this.secret = secret;
        if (projects && projects.length > 0) {
            this.projects = projects;
        } else {
            this.projects = [project];
        }
    }
}
