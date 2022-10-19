import Joi from 'joi';
import { IUser } from './user';

export interface IGroup {
    id?: number;
    name: string;
    description?: string;
    mappingsSSO?: string[];
    createdAt?: Date;
    userCount?: number;
    createdBy?: string;
}

export interface IGroupUser {
    groupId: number;
    userId: number;
    joinedAt: Date;
    seenAt?: Date;
}

export interface IGroupRole {
    name: string;
    groupId: number;
    roleId: number;
    createdAt: Date;
}

export interface IGroupModel extends IGroup {
    users: IGroupUserModel[];
    projects?: string[];
}

export interface IGroupProject {
    groupId: number;
    project: string;
}

export interface IGroupUserModel {
    user: IUser;
    joinedAt?: Date;
}

export interface IGroupModelWithProjectRole extends IGroupModel {
    roleId: number;
    addedAt: Date;
}

export default class Group implements IGroup {
    type: string;

    createdAt: Date;

    createdBy: string;

    id: number;

    name: string;

    description: string;

    mappingsSSO: string[];

    constructor({
        id,
        name,
        description,
        mappingsSSO,
        createdBy,
        createdAt,
    }: IGroup) {
        if (!id) {
            throw new TypeError('Id is required');
        }

        Joi.assert(name, Joi.string(), 'Name');

        this.id = id;
        this.name = name;
        this.description = description;
        this.mappingsSSO = mappingsSSO;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
}
