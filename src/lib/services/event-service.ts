import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import EventStore, { IEvent } from '../db/event-store';

export default class EventService {
    private logger: Logger;

    private eventStore: EventStore;

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

    async getEventsForToggle(name: string): Promise<IEvent[]> {
        return this.eventStore.getEventsFilterByName(name);
    }
}

module.exports = EventService;
