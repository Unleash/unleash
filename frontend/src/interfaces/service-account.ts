import type { IPersonalAPIToken } from './personalAPIToken.js';
import type { IUser } from './user.js';

export interface IServiceAccount extends IUser {
    tokens: IPersonalAPIToken[];
}
