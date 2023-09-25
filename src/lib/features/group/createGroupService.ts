import { IUnleashConfig } from '../../types';
import { EventService, GroupService } from '../../services';
import { Db } from '../../db/db';
import GroupStore from '../../db/group-store';
import { AccountStore } from '../../db/account-store';
import EventStore from '../../db/event-store';
import FeatureTagStore from '../../db/feature-tag-store';

export const createGroupService = (
    db: Db,
    config: IUnleashConfig,
): GroupService => {
    const { getLogger, eventBus } = config;
    const groupStore = new GroupStore(db);
    const accountStore = new AccountStore(db, getLogger);
    const eventStore = new EventStore(db, getLogger);
    const featureTagStore = new FeatureTagStore(db, eventBus, getLogger);
    const eventService = new EventService(
        { eventStore, featureTagStore },
        { getLogger },
    );
    const groupService = new GroupService(
        { groupStore, eventStore, accountStore },
        { getLogger },
        eventService,
    );
    return groupService;
};
