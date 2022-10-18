import { Store } from './store';
import Group, {
    IGroup,
    IGroupModel,
    IGroupProject,
    IGroupRole,
    IGroupUser,
    IGroupUserModel,
} from '../group';

export interface IStoreGroup {
    name: string;
    description?: string;
    mappingsSSO?: string[];
}

export interface IGroupStore extends Store<IGroup, number> {
    getGroupsForUser(userId: number): Promise<Group[]>;
    getOldGroupsForExternalUser(
        userId: number,
        externalGroups: string[],
    ): Promise<IGroupUser[]>;
    addUserToGroups(
        userId: number,
        groupIds: number[],
        createdBy?: string,
    ): Promise<void>;
    getNewGroupsForExternalUser(
        userId: number,
        externalGroups: string[],
    ): Promise<IGroup[]>;
    getGroupProjects(groupIds: number[]): Promise<IGroupProject[]>;

    getProjectGroupRoles(projectId: string): Promise<IGroupRole[]>;

    getAllWithId(ids: number[]): Promise<IGroup[]>;

    updateGroupUsers(
        groupId: number,
        newUsers: IGroupUserModel[],
        existingUsers: IGroupUserModel[],
        deletableUsers: IGroupUser[],
        userName: string,
    ): Promise<void>;

    deleteUsersFromGroup(deletableUsers: IGroupUser[]): Promise<void>;

    update(group: IGroupModel): Promise<IGroup>;

    getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]>;

    addUsersToGroup(
        groupId: number,
        users: IGroupUserModel[],
        userName: string,
    ): Promise<void>;

    existsWithName(name: string): Promise<boolean>;

    create(group: IStoreGroup): Promise<IGroup>;
}
