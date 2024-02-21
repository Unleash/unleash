import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { IFlagResolver } from '../types';

export default class EventAnnouncer {
    private logger: Logger;

    private eventStore: IEventStore;

    private flagResolver: IFlagResolver;

    constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.logger = getLogger('services/event-service.ts');
        this.flagResolver = flagResolver;
        this.eventStore = eventStore;
    }

    async publishUnannouncedEvents(): Promise<void> {
        if (this.flagResolver.isEnabled('disablePublishUnannouncedEvents')) {
            return Promise.resolve();
        } else {
            return this.eventStore.publishUnannouncedEvents();
        }
    }
}
