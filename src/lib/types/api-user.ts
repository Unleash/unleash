import { ApiTokenType } from './models/api-token';
import { CLIENT } from './permissions';

interface IApiUserData {
    username: string;
    permissions?: string[];
    projects?: string[];
    project?: string;
    environments?: string[];
    environment?: string;
    type: ApiTokenType;
    secret: string;
}

export default class ApiUser {
    readonly isAPI: boolean = true;

    readonly username: string;

    readonly permissions: string[];

    readonly projects: string[];

    readonly environments: string[];

    readonly type: ApiTokenType;

    readonly secret: string;

    constructor({
        username,
        permissions = [CLIENT],
        projects,
        project,
        environments,
        environment,
        type,
        secret,
    }: IApiUserData) {
        if (!username) {
            throw new TypeError('username is required');
        }
        this.username = username;
        this.permissions = permissions;
        this.type = type;
        this.secret = secret;
        if (projects && projects.length > 0) {
            this.projects = projects;
        } else {
            this.projects = [project];
        }
        if (environments && environments.length > 0) {
            this.environments = environments;
        } else {
            this.environments = [environment];
        }
    }
}
