import Joi from 'joi';
const { ValidationError } = Joi;
import type { IUser } from './user.js';
import { SYSTEM_USER_AUDIT } from './core.js';

export interface IGroup {
    id: number;
    name: string;
    description?: string;
    mappingsSSO?: string[];
    rootRole?: number;
    createdAt?: Date;
    userCount?: number;
    createdBy?: string;
    scimId?: string;
}

export interface IGroupUser {
    groupId: number;
    userId: number;
    joinedAt: Date;
    rootRoleId?: number;
    seenAt?: Date;
    createdBy?: string;
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

export interface ICreateGroupModel extends Omit<IGroup, 'id'> {
    users?: ICreateGroupUserModel[];
}

export interface IGroupProject {
    groupId: number;
    project: string;
}

export interface IGroupUserModel {
    user: IUser;
    joinedAt?: Date;
    createdBy?: string;
}

export interface ICreateGroupUserModel {
    user: Pick<IUser, 'id'>;
}

export interface IGroupModelWithAddedAt extends IGroupModel {
    addedAt: Date;
}

export default class Group implements IGroup {
    type: string;

    createdAt?: Date;

    createdBy: string;

    id: number;

    name: string;

    rootRole?: number;

    description: string;

    mappingsSSO: string[];

    scimId?: string;

    constructor({
        id,
        name,
        description,
        mappingsSSO,
        rootRole,
        createdBy,
        createdAt,
        scimId,
    }: IGroup) {
        if (!id) {
            throw new ValidationError('Id is required', [], undefined);
        }

        Joi.assert(name, Joi.string(), 'Name');

        this.id = id;
        this.name = name;
        this.rootRole = rootRole;
        this.description = description || '';
        this.mappingsSSO = mappingsSSO || [];
        this.createdBy = createdBy || SYSTEM_USER_AUDIT.username;
        this.createdAt = createdAt;
        this.scimId = scimId;
    }
}
