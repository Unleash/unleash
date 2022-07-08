import { IGroup, IGroupModel } from '../types/group';
import { IUnleashConfig, IUnleashStores } from '../types';
import { IGroupStore } from '../types/stores/group-store';
import { Logger } from '../logger';
import BadDataError from '../error/bad-data-error';
import { GROUP_CREATED, GROUP_UPDATED } from '../types/events';
import { IEventStore } from '../types/stores/event-store';
import NameExistsError from '../error/name-exists-error';
import { IUserStore } from '../types/stores/user-store';

export class GroupService {
    private groupStore: IGroupStore;

    private eventStore: IEventStore;

    private userStore: IUserStore;

    private logger: Logger;

    constructor(
        stores: Pick<IUnleashStores, 'groupStore' | 'eventStore' | 'userStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger' | 'authentication'>,
    ) {
        this.logger = getLogger('service/group-service.js');
        this.groupStore = stores.groupStore;
        this.eventStore = stores.eventStore;
        this.userStore = stores.userStore;
    }

    async getAll(): Promise<IGroupModel[]> {
        const groups = await this.groupStore.getAll();
        const allGroupUsers = await this.groupStore.getAllUsersByGroups(
            groups.map((g) => g.id),
        );
        const users = await this.userStore.getAllWithId(
            allGroupUsers.map((u) => u.userId),
        );
        return groups.map((group) => {
            const groupUsers = allGroupUsers.filter(
                (user) => user.groupId == group.id,
            );
            const groupUsersId = groupUsers.map((user) => user.userId);
            const selectedUsers = users.filter((user) =>
                groupUsersId.includes(user.id),
            );
            const finalUsers = selectedUsers.map((user) => ({
                user: user,
                type: groupUsers.find((gu) => gu.userId == user.id).type,
            }));
            return { ...group, users: finalUsers };
        });
    }

    async getGroup(id: number): Promise<IGroupModel> {
        const group = await this.groupStore.get(id);
        const groupUsers = await this.groupStore.getAllUsersByGroups([id]);
        const users = await this.userStore.getAllWithId(
            groupUsers.map((u) => u.userId),
        );
        const finalUsers = users.map((user) => ({
            user: user,
            type: groupUsers.find((gu) => gu.userId == user.id).type,
        }));
        return { ...group, users: finalUsers };
    }

    async createGroup(group: IGroupModel, userName: string): Promise<IGroup> {
        await this.validateGroup(group);

        const newGroup = await this.groupStore.create(group);

        await this.groupStore.addNewUsersToGroup(
            newGroup.id,
            group.users,
            userName,
        );

        await this.eventStore.store({
            type: GROUP_CREATED,
            createdBy: userName,
            data: group,
        });

        return newGroup;
    }

    async updateGroup(group: IGroupModel, userName: string): Promise<IGroup> {
        const preData = await this.groupStore.get(group.id);

        await this.validateGroup(group, preData);

        const newGroup = await this.groupStore.update(group);

        const existingUsers = await this.groupStore.getAllUsersByGroups([
            group.id,
        ]);
        const existingUserIds = existingUsers.map((g) => g.userId);

        await this.groupStore.addNewUsersToGroup(
            newGroup.id,
            group.users.filter(
                (user) => !existingUserIds.includes(user.user.id),
            ),
            userName,
        );

        const deletableUsers = existingUsers.filter(
            (existingUser) =>
                !group.users.some(
                    (groupUser) => groupUser.user.id == existingUser.userId,
                ),
        );
        await this.groupStore.deleteOldUsersFromGroup(deletableUsers);

        await this.eventStore.store({
            type: GROUP_UPDATED,
            createdBy: userName,
            data: newGroup,
            preData,
        });

        return newGroup;
    }

    async validateGroup(
        { name, users }: IGroupModel,
        existingGroup?: IGroup,
    ): Promise<void> {
        if (!name) {
            throw new BadDataError('Group name cannot be empty');
        }

        if (!existingGroup || existingGroup.name != name) {
            if (await this.groupStore.existsWithName(name)) {
                throw new NameExistsError('Group name already exists');
            }
        }

        if (users.length == 0 || !users.some((u) => u.type == 'Owner')) {
            throw new BadDataError('Group needs to have at least one Owner');
        }
    }
}
