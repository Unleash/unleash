import type { Db, IUnleashConfig } from '../../server-impl';
import GroupStore from '../../db/group-store';
import { AccountStore } from '../../db/account-store';
import RoleStore from '../../db/role-store';
import EnvironmentStore from '../project-environments/environment-store';
import { AccessStore } from '../../db/access-store';
import { AccessService, GroupService } from '../../services';
import FakeGroupStore from '../../../test/fixtures/fake-group-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store';
import FakeRoleStore from '../../../test/fixtures/fake-role-store';
import FakeEnvironmentStore from '../project-environments/fake-environment-store';
import FakeAccessStore from '../../../test/fixtures/fake-access-store';
import type { IAccessStore, IEventStore, IRoleStore } from '../../types';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';

export const createAccessService = (
    db: Db,
    config: IUnleashConfig,
): AccessService => {
    const { eventBus, getLogger } = config;
    const groupStore = new GroupStore(db);
    const accountStore = new AccountStore(db, getLogger);
    const roleStore = new RoleStore(db, eventBus, getLogger);
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
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

export const createFakeAccessService = (
    config: IUnleashConfig,
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
    const accessStore = new FakeAccessStore(roleStore);
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
