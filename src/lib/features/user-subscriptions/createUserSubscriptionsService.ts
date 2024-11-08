import type { Db, IUnleashConfig } from '../../server-impl';
import { UserSubscriptionsService } from './user-subscriptions-service';
import { UserUnsubscribeStore } from './user-unsubscribe-store';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import { FakeUserUnsubscribeStore } from './fake-user-unsubscribe-store';
import { UserSubscriptionsReadModel } from './user-subscriptions-read-model';
import { FakeUserSubscriptionsReadModel } from './fake-user-subscriptions-read-model';

export const createUserSubscriptionsService =
    (config: IUnleashConfig) =>
    (db: Db): UserSubscriptionsService => {
        const userUnsubscribeStore = new UserUnsubscribeStore(db);
        const userSubscriptionsReadModel = new UserSubscriptionsReadModel(db);
        const eventService = createEventsService(db, config);

        const userSubscriptionsService = new UserSubscriptionsService(
            { userUnsubscribeStore, userSubscriptionsReadModel },
            config,
            eventService,
        );

        return userSubscriptionsService;
    };

export const createFakeUserSubscriptionsService = (
    config: IUnleashConfig,
): UserSubscriptionsService => {
    const userUnsubscribeStore = new FakeUserUnsubscribeStore();
    const userSubscriptionsReadModel = new FakeUserSubscriptionsReadModel();
    const eventService = createFakeEventsService(config);

    const userSubscriptionsService = new UserSubscriptionsService(
        { userUnsubscribeStore, userSubscriptionsReadModel },
        config,
        eventService,
    );

    return userSubscriptionsService;
};
