import { Store } from './store';
import { IGroup, IGroupModel, IGroupUser, IGroupUserModel } from '../group';

export interface IStoreGroup {
    name: string;
    description: string;
}

export interface IGroupStore extends Store<IGroup, number> {
    deleteOldUsersFromGroup(deletableUsers: IGroupUser[]);
    update(group: IGroupModel): Promise<IGroup>;
    getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]>;
    addNewUsersToGroup(id: number, users: IGroupUserModel[], userName: string);
    existsWithName(name: string): Promise<boolean>;
    create(group: IStoreGroup): Promise<IGroup>;
}
