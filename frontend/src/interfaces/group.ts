import { IUser } from './user';

export enum Role {
    Owner = 'Owner',
    Member = 'Member',
}

export interface IGroup {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    users: IGroupUser[];
    projects: string[];
    addedAt?: string;
}

export interface IGroupUser extends IUser {
    role: Role;
    joinedAt?: Date;
}

export interface IGroupUserModel {
    user: {
        id: number;
    };
    role: Role;
}
