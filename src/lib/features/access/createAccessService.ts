import { Db, IUnleashConfig } from 'lib/server-impl';
import EventStore from '../../db/event-store';
import GroupStore from '../../db/group-store';
import { AccountStore } from '../../db/account-store';
import RoleStore from '../../db/role-store';
import EnvironmentStore from '../../db/environment-store';
import { AccessStore } from '../../db/access-store';
import { AccessService, GroupService } from '../../services';
import FakeGroupStore from '../../../test/fixtures/fake-group-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store';
import FakeRoleStore from '../../../test/fixtures/fake-role-store';
import FakeEnvironmentStore from '../../../test/fixtures/fake-environment-store';
import FakeAccessStore from '../../../test/fixtures/fake-access-store';

export const createAccessService = (
    db: Db,
    config: IUnleashConfig,
): AccessService => {
    const { eventBus, getLogger, flagResolver } = config;
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
        { getLogger, flagResolver },
        groupService,
    );
};

export const createFakeAccessService = (
    config: IUnleashConfig,
): AccessService => {
    const { getLogger, flagResolver } = config;
    const eventStore = new FakeEventStore();
    const groupStore = new FakeGroupStore();
    const accountStore = new FakeAccountStore();
    const roleStore = new FakeRoleStore();
    const environmentStore = new FakeEnvironmentStore();
    const accessStore = new FakeAccessStore(roleStore);
    const groupService = new GroupService(
        { groupStore, eventStore, accountStore },
        { getLogger },
    );

    return new AccessService(
        { accessStore, accountStore, roleStore, environmentStore },
        { getLogger, flagResolver },
        groupService,
    );
};
