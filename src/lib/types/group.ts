import Joi from 'joi';
import { IUser } from './user';

export interface IGroup {
    id?: number;
    name: string;
    description: string;
    createdAt?: Date;
    createdBy?: string;
}

export interface IGroupUser {
    groupId: number;
    userId: number;
    role: string;
    joinedAt: Date;
}

export interface IGroupUserModel {
    user: IUser;
    role: string;
    joinedAt?: Date;
}

export interface IGroupModel extends IGroup {
    users: IGroupUserModel[];
}

export default class Group implements IGroup {
    type: string;

    createdAt: Date;

    createdBy: string;

    id: number;

    name: string;

    description: string;

    constructor({ id, name, description, createdBy, createdAt }: IGroup) {
        if (!id) {
            throw new TypeError('Id is required');
        }

        Joi.assert(name, Joi.string(), 'Name');

        this.id = id;
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
}
