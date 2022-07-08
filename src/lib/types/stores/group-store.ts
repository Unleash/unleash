import { Store } from './store';
import { IGroup, IGroupUser, IGroupUserModel } from '../group';

export interface IStoreGroup {
    name: string;
    description: string;
}

export interface IGroupStore extends Store<IGroup, number> {
    getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]>;
    addUsersToGroup(id: number, users: IGroupUserModel[], userName: string);
    existsWithName(name: string): Promise<boolean>;
    create(group: IStoreGroup): Promise<IGroup>;
}
