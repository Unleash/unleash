import { ApiTokenType } from './models/api-token';
import { CLIENT } from './permissions';

interface IApiUserData {
    username: string;
    permissions?: string[];
    project: string;
    environment: string;
    type: ApiTokenType;
}

export default class ApiUser {
    readonly isAPI: boolean = true;

    readonly username: string;

    readonly permissions: string[];

    readonly project: string;

    readonly environment: string;

    readonly type: ApiTokenType;

    constructor({
        username,
        permissions = [CLIENT],
        project,
        environment,
        type,
    }: IApiUserData) {
        if (!username) {
            throw new TypeError('username is required');
        }
        this.username = username;
        this.permissions = permissions;
        this.project = project;
        this.environment = environment;
        this.type = type;
    }
}
