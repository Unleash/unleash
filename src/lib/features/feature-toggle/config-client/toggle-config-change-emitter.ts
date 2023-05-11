import { Logger } from 'lib/logger';
import { IEventStore } from 'lib/types';

export default class ToggleConfigChangeEmitter {
    private logger: Logger;

    private eventStore: IEventStore;

    private revisionId: number;

    constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger(
            'features/config-client/toggle-config-change-emitter',
        );
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
        this.revisionId = await this.eventStore.getMaxRevisionId(
            this.revisionId,
        );
        return this.revisionId;
    }
}
