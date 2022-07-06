import { Store } from './store';
import { IGroup, IGroupUser } from '../group';

export interface ICreateGroup {
    name: string;
    description: string;
    users: IGroupUser[];
}

export interface IGroupStore extends Store<IGroup, number> {
    addUsersToGroup(id: number, users: IGroupUser[], userName: string);
    existsWithName(name: string): Promise<boolean>;
    create(group: ICreateGroup): Promise<IGroup>;
}
