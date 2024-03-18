import type { Store } from './store';
import type Group from '../group';
import type {
    ICreateGroupUserModel,
    IGroup,
    IGroupModel,
    IGroupProject,
    IGroupRole,
    IGroupUser,
} from '../group';
import type { IGroupWithProjectRoles } from './access-store';

export interface IStoreGroup {
    name: string;
    description?: string;
    mappingsSSO?: string[];
    rootRole?: number;
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

    getProjectGroups(projectId: string): Promise<IGroupWithProjectRoles[]>;

    getAllWithId(ids: number[]): Promise<IGroup[]>;

    updateGroupUsers(
        groupId: number,
        newUsers: ICreateGroupUserModel[],
        deletableUsers: IGroupUser[],
        userName: string,
    ): Promise<void>;

    deleteUsersFromGroup(deletableUsers: IGroupUser[]): Promise<void>;

    update(group: IGroupModel): Promise<IGroup>;

    getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]>;

    addUsersToGroup(
        groupId: number,
        users: ICreateGroupUserModel[],
        userName: string,
    ): Promise<void>;

    existsWithName(name: string): Promise<boolean>;

    hasProjectRole(groupId: number): Promise<boolean>;

    create(group: IStoreGroup): Promise<IGroup>;

    count(): Promise<number>;
}
