import type { IUser } from './user.js';

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
    rootRole?: number;
    scimId?: string;
}

export interface IGroupUser extends IUser {
    joinedAt?: Date;
}

export interface IGroupUserModel {
    user: {
        id: number;
    };
}
