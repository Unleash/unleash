import { Store } from './store';
import { IGroup, IGroupModel, IGroupUser, IGroupUserModel } from '../group';

export interface IGroupStore extends Store<IGroup, number> {
    getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]>;
    addUsersToGroup(id: number, users: IGroupUserModel[], userName: string);
    existsWithName(name: string): Promise<boolean>;
    create(group: IGroupModel): Promise<IGroup>;
}
