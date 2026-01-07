import type { Db, IUnleashConfig } from '../../types/index.js';
import GroupStore from '../../db/group-store.js';
import { AccountStore } from '../../db/account-store.js';
import RoleStore from '../../db/role-store.js';
import EnvironmentStore from '../project-environments/environment-store.js';
import { AccessStore } from '../../db/access-store.js';
import { AccessService, GroupService } from '../../services/index.js';
import FakeGroupStore from '../../../test/fixtures/fake-group-store.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store.js';
import FakeRoleStore from '../../../test/fixtures/fake-role-store.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import FakeAccessStore, {
    type FakeAccessStoreConfig,
} from '../../../test/fixtures/fake-access-store.js';
import type {
    IAccessStore,
    IEventStore,
    IRoleStore,
} from '../../types/index.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';

export const createAccessService = (
    db: Db,
    config: IUnleashConfig,
): AccessService => {
    const { eventBus, getLogger } = config;
    const groupStore = new GroupStore(db);
    const accountStore = new AccountStore(db, getLogger);
    const roleStore = new RoleStore(db, eventBus, getLogger);
    const environmentStore = new EnvironmentStore(db, eventBus, config);
    const accessStore = new AccessStore(db, eventBus, getLogger);
    const eventService = createEventsService(db, config);
    const groupService = new GroupService(
        { groupStore, accountStore },
        { getLogger },
        eventService,
    );
    return new AccessService(
        { accessStore, accountStore, roleStore, environmentStore },
        { getLogger },
        groupService,
        eventService,
    );
};

export type FakeAccessServiceConfig = {
    accessStoreConfig?: FakeAccessStoreConfig;
};

export const createFakeAccessService = (
    config: IUnleashConfig,
    { accessStoreConfig }: FakeAccessServiceConfig = {},
): {
    accessService: AccessService;
    eventStore: IEventStore;
    accessStore: IAccessStore;
    roleStore: IRoleStore;
} => {
    const { getLogger } = config;
    const eventStore = new FakeEventStore();
    const groupStore = new FakeGroupStore();
    const accountStore = new FakeAccountStore();
    const roleStore = new FakeRoleStore();
    const environmentStore = new FakeEnvironmentStore();
    const accessStore = new FakeAccessStore(roleStore, accessStoreConfig);
    const eventService = createFakeEventsService(config, { eventStore });
    const groupService = new GroupService(
        { groupStore, accountStore },
        { getLogger },
        eventService,
    );

    const accessService = new AccessService(
        { accessStore, accountStore, roleStore, environmentStore, groupStore },
        { getLogger },
        groupService,
        eventService,
    );

    return {
        accessService,
        eventStore,
        accessStore,
        roleStore,
    };
};
