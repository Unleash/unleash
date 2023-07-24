import { IUnleashConfig } from '../../types';
import { GroupService } from '../../services';
import { Db } from '../../db/db';
import GroupStore from '../../db/group-store';
import { AccountStore } from '../../db/account-store';
import EventStore from '../../db/event-store';

export const createGroupService = (
    db: Db,
    config: IUnleashConfig,
): GroupService => {
    const { getLogger } = config;
    const groupStore = new GroupStore(db);
    const accountStore = new AccountStore(db, getLogger);
    const eventStore = new EventStore(db, getLogger);
    const groupService = new GroupService(
        { groupStore, eventStore, accountStore },
        { getLogger },
    );
    return groupService;
};
