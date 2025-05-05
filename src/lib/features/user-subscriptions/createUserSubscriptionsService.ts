import type { Db, IUnleashConfig } from '../../types/index.js';
import { UserSubscriptionsService } from './user-subscriptions-service.js';
import { UserUnsubscribeStore } from './user-unsubscribe-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';
import { FakeUserUnsubscribeStore } from './fake-user-unsubscribe-store.js';
import { UserSubscriptionsReadModel } from './user-subscriptions-read-model.js';
import { FakeUserSubscriptionsReadModel } from './fake-user-subscriptions-read-model.js';

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
