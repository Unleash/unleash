import { ADMIN } from './permissions';

export const ADMIN_TOKEN_ID = -1;
export default class NoAuthUser {
    isAPI: boolean;

    username: string;

    id: number;

    permissions: string[];

    constructor(
        username: string = 'unknown',
        id: number = ADMIN_TOKEN_ID,
        permissions: string[] = [ADMIN],
    ) {
        this.isAPI = true;
        this.username = username;
        this.id = id;
        this.permissions = permissions;
    }
}
