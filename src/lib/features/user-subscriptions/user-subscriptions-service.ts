import type { IUnleashConfig, IUnleashStores } from '../../types';
import type { Logger } from '../../logger';
import type { IAuditUser } from '../../types/user';
import type {
    IUserUnsubscribeStore,
    UnsubscribeEntry,
} from './user-unsubscribe-store-type';
import type EventService from '../events/event-service';

export class UserSubscriptionsService {
    private userUnsubscribeStore: IUserUnsubscribeStore;

    private eventService: EventService;

    private logger: Logger;

    constructor(
        { userUnsubscribeStore }: Pick<IUnleashStores, 'userUnsubscribeStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.userUnsubscribeStore = userUnsubscribeStore;
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
}
