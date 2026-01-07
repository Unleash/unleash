import { InactiveUsersService } from './inactive-users-service.js';
import type { IUnleashConfig } from '../../types/index.js';
import type { Db } from '../../types/index.js';
import { InactiveUsersStore } from './inactive-users-store.js';
import { FakeInactiveUsersStore } from './fakes/fake-inactive-users-store.js';
import type { UserService } from '../../services/index.js';

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
