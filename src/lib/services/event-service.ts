import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { IEvent } from '../types/events';
import { SearchEventsSchema } from '../openapi/spec/search-events-schema';

export default class EventService {
    private logger: Logger;

    private eventStore: IEventStore;

    constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/event-service.ts');
        this.eventStore = eventStore;
    }

    async getEvents(): Promise<IEvent[]> {
        return this.eventStore.getEvents();
    }

    async searchEvents(search: SearchEventsSchema): Promise<IEvent[]> {
        return this.eventStore.searchEvents(search);
    }
}

module.exports = EventService;
