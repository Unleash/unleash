import { ApiTokenType } from './models/api-token';
import { FRONTEND } from './permissions';

export default class NoAuthFrontendAPIUser {
    isAPI: boolean;

    username: string;

    id: number;

    permissions: string[];

    projects: string[];

    type: ApiTokenType;

    constructor(
        username: string = 'unknown',
        permissions: string[] = [FRONTEND],
        projects: string[] = ['default'],
    ) {
        this.isAPI = true;
        this.username = username;
        this.permissions = permissions;
        this.projects = projects;
        this.type = ApiTokenType.FRONTEND;
    }
}
