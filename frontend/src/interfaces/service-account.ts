import type { IPersonalAPIToken } from './personalAPIToken';
import type { IUser } from './user';

export interface IServiceAccount extends IUser {
    tokens: IPersonalAPIToken[];
}
