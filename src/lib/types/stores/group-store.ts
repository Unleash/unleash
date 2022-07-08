import { Store } from './store';
import { IGroup, IGroupModel, IGroupUser, IGroupUserModel } from '../group';

export interface IStoreGroup {
    name: string;
    description: string;
}

export interface IGroupStore extends Store<IGroup, number> {
    updateGroupUsers(
        groupId: number,
        newUsers: IGroupUserModel[],
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
    existsWithName(name: string): Promise<boolean>;
    create(group: IStoreGroup): Promise<IGroup>;
}
