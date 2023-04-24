import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { IEventList } from '../types/events';
import { SearchEventsSchema } from '../openapi/spec/search-events-schema';
import { EventEmitter } from 'stream';

export default class EventService extends EventEmitter {
    private logger: Logger;

    private eventStore: IEventStore;

    private revisionId: number;

    constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        super();
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

    async getMaxRevisionId(): Promise<number> {
        if (this.revisionId) {
            return this.revisionId;
        } else {
            return this.updateMaxRevisionId();
        }
    }

    async updateMaxRevisionId(): Promise<number> {
        const revisionId = await this.eventStore.getMaxRevisionId(
            this.revisionId,
        );
        if (this.revisionId !== revisionId) {
            this.logger.info('updating rev ID!', revisionId);
            this.emit('update', revisionId);
            this.revisionId = revisionId;
        }

        return this.revisionId;
    }
}

module.exports = EventService;
