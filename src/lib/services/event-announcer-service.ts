import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';

export default class EventAnnouncer {
    private logger: Logger;

    private eventStore: IEventStore;

    constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/event-service.ts');
        this.eventStore = eventStore;
    }

    async publishUnannouncedEvents(): Promise<void> {
        return this.eventStore.publishUnannouncedEvents();
    }
}
