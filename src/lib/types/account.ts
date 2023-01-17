import { IUser } from './user';

export const AccountTypes = ['User', 'Service Account'] as const;
type AccountType = typeof AccountTypes[number];

export interface IAccount extends IUser {
    type?: AccountType;
}

export interface IProjectAccount extends IAccount {
    addedAt: Date;
}

export interface IAccountWithRole extends IAccount {
    roleId: number;
}
