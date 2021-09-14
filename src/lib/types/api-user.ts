import { CLIENT } from './permissions';

interface IApiUserData {
    username: string;
    permissions?: string[];
    project: string;
    environment: string;
}

export default class ApiUser {
    readonly isAPI: boolean = true;

    readonly username: string;

    readonly permissions: string[];

    readonly project: string;

    readonly environment: string;

    constructor({
        username,
        permissions = [CLIENT],
        project,
        environment,
    }: IApiUserData) {
        if (!username) {
            throw new TypeError('username is required');
        }
        this.username = username;
        this.permissions = permissions;
        this.project = project;
        this.environment = environment;
    }
}

module.exports = ApiUser;
