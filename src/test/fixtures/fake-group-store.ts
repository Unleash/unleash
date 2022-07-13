import { IGroupStore, IStoreGroup } from '../../lib/types/stores/group-store';
import {
    IGroup,
    IGroupModel,
    IGroupUser,
    IGroupUserModel,
} from '../../lib/types/group';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakeGroupStore implements IGroupStore {
    data: IGroup[];

    async getAll(): Promise<IGroup[]> {
        return Promise.resolve(this.data);
    }

    async delete(id: number): Promise<void> {
        this.data = this.data.filter((item) => item.id !== id);
        return Promise.resolve();
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        return this.data.some((u) => u.id === key);
    }

    async get(key: number): Promise<IGroup> {
        return this.data.find((u) => u.id === key);
    }

    create(group: IStoreGroup): Promise<IGroup> {
        throw new Error('Method not implemented.');
    }

    existsWithName(name: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    addNewUsersToGroup(
        id: number,
        users: IGroupUserModel[],
        userName: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    updateExistingUsersInGroup(
        id: number,
        users: IGroupUserModel[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getAllUsersByGroups(groupIds: number[]): Promise<IGroupUser[]> {
        throw new Error('Method not implemented.');
    }

    deleteOldUsersFromGroup(deletableUsers: IGroupUser[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    update(group: IGroupModel): Promise<IGroup> {
        throw new Error('Method not implemented.');
    }

    updateGroupUsers(
        groupId: number,
        newUsers: IGroupUserModel[],
        existingUsers: IGroupUserModel[],
        deletableUsers: IGroupUser[],
        userName: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
