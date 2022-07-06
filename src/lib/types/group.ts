import Joi from 'joi';
import { IUser } from './user';

export interface IGroup {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    createdBy: string;
}

export interface IGroupUser {
    user: IUser;
    type: string;
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
