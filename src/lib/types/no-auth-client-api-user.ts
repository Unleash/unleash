import { ApiTokenType } from './models/api-token';
import { CLIENT } from './permissions';

export default class NoAuthClientAPIUser {
    isAPI: boolean;

    username: string;

    id: number;

    permissions: string[];

    projects: string[];

    type: ApiTokenType;

    constructor(
        username: string = 'unknown',
        permissions: string[] = [CLIENT],
        projects: string[] = ['default'],
    ) {
        this.isAPI = true;
        this.username = username;
        this.permissions = permissions;
        this.projects = projects;
        this.type = ApiTokenType.CLIENT;
    }
}
