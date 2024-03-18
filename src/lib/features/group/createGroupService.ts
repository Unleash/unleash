import type { IUnleashConfig } from '../../types';
import { GroupService } from '../../services';
import type { Db } from '../../db/db';
import GroupStore from '../../db/group-store';
import { AccountStore } from '../../db/account-store';
import { createEventsService } from '../events/createEventsService';

export const createGroupService = (
    db: Db,
    config: IUnleashConfig,
): GroupService => {
    const { getLogger } = config;
    const groupStore = new GroupStore(db);
    const accountStore = new AccountStore(db, getLogger);
    const eventService = createEventsService(db, config);
    const groupService = new GroupService(
        { groupStore, accountStore },
        { getLogger },
        eventService,
    );
    return groupService;
};
