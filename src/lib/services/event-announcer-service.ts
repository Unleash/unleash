import type { IUnleashConfig } from '../types/option.js';
import type { IUnleashStores } from '../types/stores.js';
import type { Logger } from '../logger.js';
import type { IEventStore } from '../types/stores/event-store.js';
import type { IFlagResolver } from '../types/index.js';

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
