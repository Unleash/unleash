import type { Db, IUnleashConfig } from '../../server-impl';
import { UserSubscriptionsService } from './user-subscriptions-service';
import { UserUnsubscribeStore } from './user-unsubscribe-store';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import { FakeUserUnsubscribeStore } from './fake-user-unsubscribe-store';

export const createUserSubscriptionsService =
    (config: IUnleashConfig) =>
    (db: Db): UserSubscriptionsService => {
        const userUnsubscribeStore = new UserUnsubscribeStore(db);
        const eventService = createEventsService(db, config);

        const userSubscriptionsService = new UserSubscriptionsService(
            { userUnsubscribeStore },
            config,
            eventService,
        );

        return userSubscriptionsService;
    };

export const createFakeUserSubscriptionsService = (
    config: IUnleashConfig,
): UserSubscriptionsService => {
    const userUnsubscribeStore = new FakeUserUnsubscribeStore();
    const eventService = createFakeEventsService(config);

    const userSubscriptionsService = new UserSubscriptionsService(
        { userUnsubscribeStore },
        config,
        eventService,
    );

    return userSubscriptionsService;
};
