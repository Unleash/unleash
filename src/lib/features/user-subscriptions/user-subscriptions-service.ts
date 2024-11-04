import type { IUnleashConfig, IUnleashStores } from '../../types';
import type { Logger } from '../../logger';
import type { IAuditUser } from '../../types/user';
import type {
    IUserUnsubscribeStore,
    UnsubscribeEntry,
} from './user-unsubscribe-store-type';
import type EventService from '../events/event-service';
import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type';

export default class UserSubscriptionService {
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
        // TODO: log an event
        // await this.eventService.storeEvent(
        //     new UserSubscriptionEvent({
        //         data: { ...entry, action: 'subscribed' },
        //         auditUser,
        //     }),
        // );
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
        // TODO: log an event
        // await this.eventService.storeEvent(
        //     new UserSubscriptionEvent({
        //         data: { ...entry, action: 'unsubscribed' },
        //         auditUser,
        //     }),
        // );
    }

    async getSubscribed(subscription: string) {
        return this.userSubscriptionsReadModel.getSubscribedUsers(subscription);
    }
}
