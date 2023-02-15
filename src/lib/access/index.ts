import { Db, IUnleashConfig } from 'lib/server-impl';
import EventStore from '../db/event-store';
import GroupStore from '../db/group-store';
import { AccountStore } from '../db/account-store';
import RoleStore from '../db/role-store';
import EnvironmentStore from '../db/environment-store';
import { AccessStore } from '../db/access-store';
import { AccessService, GroupService } from '../services';

export const createAccessService = (
    db: Db,
    config: IUnleashConfig,
): AccessService => {
    const { eventBus, getLogger } = config;
    const eventStore = new EventStore(db, getLogger);
    const groupStore = new GroupStore(db);
    const accountStore = new AccountStore(db, getLogger);
    const roleStore = new RoleStore(db, eventBus, getLogger);
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
    const accessStore = new AccessStore(db, eventBus, getLogger);
    const groupService = new GroupService(
        { groupStore, eventStore, accountStore },
        { getLogger },
    );

    return new AccessService(
        { accessStore, accountStore, roleStore, environmentStore },
        { getLogger },
        groupService,
    );
};
