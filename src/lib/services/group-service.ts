import { IGroup } from '../types/group';
import { IUnleashConfig, IUnleashStores } from '../types';
import { ICreateGroup, IGroupStore } from '../types/stores/group-store';
import { Logger } from '../logger';
import BadDataError from '../error/bad-data-error';
import { GROUP_CREATED } from '../types/events';
import { IEventStore } from '../types/stores/event-store';
import NameExistsError from '../error/name-exists-error';

export class GroupService {
    private store: IGroupStore;

    private eventStore: IEventStore;

    private logger: Logger;

    constructor(
        stores: Pick<IUnleashStores, 'groupStore' | 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger' | 'authentication'>,
    ) {
        this.logger = getLogger('service/group-service.js');
        this.store = stores.groupStore;
        this.eventStore = stores.eventStore;
    }

    async getAll(): Promise<IGroup[]> {
        const groups = await this.store.getAll();
        return groups;
    }

    async createGroup(group: ICreateGroup, userName: string): Promise<IGroup> {
        await this.validateGroup(group);

        const newGroup = await this.store.create(group);

        await this.store.addUsersToGroup(newGroup.id, group.users, userName);

        await this.eventStore.store({
            type: GROUP_CREATED,
            createdBy: userName,
            data: group,
        });

        return newGroup;
    }

    async validateGroup({ name, users }: ICreateGroup): Promise<void> {
        if (!name) {
            throw new BadDataError('Group name cannot be empty');
        }

        if (await this.store.existsWithName(name)) {
            throw new NameExistsError('Group name already exists');
        }
        if (users.length == 0 || !users.some((u) => u.type == 'Admin')) {
            throw new BadDataError('Group needs to have at least ');
        }
    }
}
