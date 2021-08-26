import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { IEvent } from '../types/model';
import { FEATURE_METADATA_UPDATED } from '../types/events';

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

    async getEventsForToggle(name: string): Promise<IEvent[]> {
        const events = await this.eventStore.getEventsFilterByType(name);
        return events.filter(
            (e: IEvent) => e.type !== FEATURE_METADATA_UPDATED,
        );
    }
}

module.exports = EventService;
