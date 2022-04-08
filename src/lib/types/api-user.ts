import { ApiTokenType } from './models/api-token';
import { CLIENT } from './permissions';

interface IApiUserData {
    username: string;
    permissions?: string[];
    projects?: string[];
    project?: string;
    environment: string;
    type: ApiTokenType;
}

export default class ApiUser {
    readonly isAPI: boolean = true;

    readonly username: string;

    readonly permissions: string[];

    readonly projects: string[];

    readonly environment: string;

    readonly type: ApiTokenType;

    constructor({
        username,
        permissions = [CLIENT],
        projects,
        project,
        environment,
        type,
    }: IApiUserData) {
        if (!username) {
            throw new TypeError('username is required');
        }
        this.username = username;
        this.permissions = permissions;
        this.environment = environment;
        this.type = type;
        if (projects && projects.length > 0) {
            this.projects = projects;
        } else {
            this.projects = [project];
        }
    }
}
