import type { IUnleashConfig } from '../../types/index.js';
import { GroupService } from '../../services/index.js';
import type { Db } from '../../db/db.js';
import GroupStore from '../../db/group-store.js';
import { AccountStore } from '../../db/account-store.js';
import { createEventsService } from '../events/createEventsService.js';

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
