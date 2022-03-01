import { ADMIN } from './permissions';

export default class NoAuthUser {
    isAPI: boolean;

    username: string;

    id: number;

    permissions: string[];

    constructor(
        username: string = 'unknown',
        id: number = -1,
        permissions: string[] = [ADMIN],
    ) {
        this.isAPI = true;
        this.username = username;
        this.id = id;
        this.permissions = permissions;
    }
}
