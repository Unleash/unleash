import { InactiveUsersService } from './inactive-users-service';
import type { IUnleashConfig } from '../../server-impl';
import type { Db } from '../../server-impl';
import { InactiveUsersStore } from './inactive-users-store';
import { FakeInactiveUsersStore } from './fakes/fake-inactive-users-store';
import type { UserService } from '../../services';

export const createInactiveUsersService = (
    db: Db,
    config: IUnleashConfig,
    userService: UserService,
): InactiveUsersService => {
    const { eventBus, getLogger, userInactivityThresholdInDays } = config;
    const inactiveUsersStore = new InactiveUsersStore(db, eventBus, getLogger);

    return new InactiveUsersService(
        { inactiveUsersStore },
        { getLogger, userInactivityThresholdInDays },
        { userService },
    );
};

export const createFakeInactiveUsersService = (
    {
        getLogger,
        userInactivityThresholdInDays,
    }: Pick<IUnleashConfig, 'getLogger' | 'userInactivityThresholdInDays'>,
    userService: UserService,
): InactiveUsersService => {
    const fakeStore = new FakeInactiveUsersStore();
    return new InactiveUsersService(
        { inactiveUsersStore: fakeStore },
        { getLogger, userInactivityThresholdInDays },
        { userService },
    );
};
