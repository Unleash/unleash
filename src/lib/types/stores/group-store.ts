import { Store } from './store';
import {
    IGroup,
    IGroupModel,
    IGroupRole,
    IGroupUser,
    IGroupUserModel,
} from '../group';

export interface IStoreGroup {
    name: string;
    description: string;
}

export interface IGroupStore extends Store<IGroup, number> {
    getProjectGroupRoles(projectId: string): Promise<IGroupRole[]>;
    getAllWithId(ids: number[]): Promise<IGroup[]>;
    updateGroupUsers(
        groupId: number,
        newUsers: IGroupUserModel[],
        existingUsers: IGroupUserModel[],
        deletableUsers: IGroupUser[],
        userName: string,
    ): Promise<void>;
    deleteOldUsersFromGroup(deletableUsers: IGroupUser[]): Promise<void>;
    update(group: IGroupModel): Promise<IGroup>;
    getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]>;
    addNewUsersToGroup(
        groupId: number,
        users: IGroupUserModel[],
        userName: string,
    ): Promise<void>;
    updateExistingUsersInGroup(
        groupId: number,
        users: IGroupUserModel[],
    ): Promise<void>;
    existsWithName(name: string): Promise<boolean>;
    create(group: IStoreGroup): Promise<IGroup>;
}
