import { CLIENT } from '../permissions';

interface IApiUserData {
    username: string;
    permissions?: string[];
}

export default class ApiUser {
    isAPI: boolean = true;

    username: string;

    permissions: string[];

    constructor({ username, permissions = [CLIENT] }: IApiUserData) {
        if (!username) {
            throw new TypeError('username is required');
        }
        this.username = username;
        this.permissions = permissions;
    }
}

module.exports = ApiUser;
