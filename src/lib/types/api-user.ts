import { ApiTokenType } from './models/api-token';
import { ValidationError } from 'joi';

import { CLIENT } from './permissions';

interface IApiUserData {
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

    readonly permissions: string[];

    readonly projects: string[];

    readonly environment: string;

    readonly type: ApiTokenType;

    readonly secret: string;

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
