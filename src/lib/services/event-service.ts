import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { IEventList } from '../types/events';
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

    async getEvents(): Promise<IEventList> {
        let totalEvents = await this.eventStore.count();
        let events = await this.eventStore.getEvents();
        return {
            events,
            totalEvents,
        };
    }

    async searchEvents(search: SearchEventsSchema): Promise<IEventList> {
        let totalEvents = await this.eventStore.filteredCount(search);
        let events = await this.eventStore.searchEvents(search);
        return {
            events,
            totalEvents,
        };
    }
}

module.exports = EventService;
