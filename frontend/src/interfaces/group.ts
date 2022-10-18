import { IUser } from './user';

export interface IGroup {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    users: IGroupUser[];
    projects: string[];
    addedAt?: string;
    userCount?: number;
    mappingsSSO: string[];
}

export interface IGroupUser extends IUser {
    joinedAt?: Date;
}

export interface IGroupUserModel {
    user: {
        id: number;
    };
}
