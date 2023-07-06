import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { sharedEventEmitter } from '../util/anyEventEmitter';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import EventEmitter from 'events';

export default class EventAnnouncer {
    private logger: Logger;

    private eventStore: IEventStore;

    private eventEmitter: EventEmitter;

    constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/event-service.ts');
        this.eventStore = eventStore;
        this.eventEmitter = sharedEventEmitter;
    }

    async publishUnannouncedEvents(): Promise<void> {
        const events = await this.eventStore.setUnannouncedToAnnounced();
        if (events.length) {
            console.log('about to announce these events', events);
        }

        events.forEach((e) => this.eventEmitter.emit(e.type, e));
    }
}
