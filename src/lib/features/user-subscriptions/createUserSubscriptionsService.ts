import type { Db, IUnleashConfig } from '../../server-impl';
import UserSubscriptionService from './user-subscriptions-service';
import { UserUnsubscribeStore } from './user-unsubscribe-store';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import { FakeUserUnsubscribeStore } from './fake-user-unsubscribe-store';

export const createUserSubscriptionsService =
    (config: IUnleashConfig) =>
    (db: Db): UserSubscriptionService => {
        const userUnsubscribeStore = new UserUnsubscribeStore(db);
        const eventService = createEventsService(db, config);

        const userSubscriptionsService = new UserSubscriptionService(
            { userUnsubscribeStore },
            config,
            eventService,
        );

        return userSubscriptionsService;
    };

export const createFakeUserSubscriptionsService = (config: IUnleashConfig) => {
    const userUnsubscribeStore = new FakeUserUnsubscribeStore();
    const eventService = createFakeEventsService(config);

    const userSubscriptionsService = new UserSubscriptionService(
        { userUnsubscribeStore },
        config,
        eventService,
    );

    return userSubscriptionsService;
};
