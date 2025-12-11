import {
    UserPreferenceUpdatedEvent,
    type IUnleashConfig,
    type IUnleashStores,
} from '../../types/index.js';
import type { IAuditUser } from '../../types/user.js';
import type {
    IUserUnsubscribeStore,
    UnsubscribeEntry,
} from './user-unsubscribe-store-type.js';
import type EventService from '../events/event-service.js';
import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type.js';

export class UserSubscriptionsService {
    private userUnsubscribeStore: IUserUnsubscribeStore;

    private userSubscriptionsReadModel: IUserSubscriptionsReadModel;

    private eventService: EventService;

    constructor(
        {
            userUnsubscribeStore,
            userSubscriptionsReadModel,
        }: Pick<
            IUnleashStores,
            'userUnsubscribeStore' | 'userSubscriptionsReadModel'
        >,
        { getLogger: _getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.userUnsubscribeStore = userUnsubscribeStore;
        this.userSubscriptionsReadModel = userSubscriptionsReadModel;
        this.eventService = eventService;
    }

    async getUserSubscriptions(userId: number) {
        return this.userSubscriptionsReadModel.getUserSubscriptions(userId);
    }

    async subscribe(
        userId: number,
        subscription: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        const entry: UnsubscribeEntry = {
            userId,
            subscription,
        };

        await this.userUnsubscribeStore.delete(entry);
        await this.eventService.storeEvent(
            new UserPreferenceUpdatedEvent({
                userId,
                data: { subscription, action: 'subscribed' },
                auditUser,
            }),
        );
    }

    async unsubscribe(
        userId: number,
        subscription: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        const entry: UnsubscribeEntry = {
            userId,
            subscription,
        };

        await this.userUnsubscribeStore.insert(entry);
        await this.eventService.storeEvent(
            new UserPreferenceUpdatedEvent({
                userId,
                data: { subscription, action: 'unsubscribed' },
                auditUser,
            }),
        );
    }
}
