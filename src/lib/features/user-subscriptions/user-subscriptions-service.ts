import {
    UserPreferenceUpdatedEvent,
    type IUnleashConfig,
    type IUnleashStores,
} from '../../types';
import type { Logger } from '../../logger';
import type { IAuditUser } from '../../types/user';
import type {
    IUserUnsubscribeStore,
    UnsubscribeEntry,
} from './user-unsubscribe-store-type';
import type EventService from '../events/event-service';
import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type';

export class UserSubscriptionsService {
    private userUnsubscribeStore: IUserUnsubscribeStore;

    private userSubscriptionsReadModel: IUserSubscriptionsReadModel;

    private eventService: EventService;

    private logger: Logger;

    constructor(
        {
            userUnsubscribeStore,
            userSubscriptionsReadModel,
        }: Pick<
            IUnleashStores,
            'userUnsubscribeStore' | 'userSubscriptionsReadModel'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.userUnsubscribeStore = userUnsubscribeStore;
        this.userSubscriptionsReadModel = userSubscriptionsReadModel;
        this.eventService = eventService;
        this.logger = getLogger('services/user-subscription-service.ts');
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
