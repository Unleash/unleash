import { IPersonalAPIToken } from './personalAPIToken';
import { IUser } from './user';

export interface IServiceAccount extends IUser {
    tokens: IPersonalAPIToken[];
}
