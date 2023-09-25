import { IUnleashConfig } from '../types/option';
import { IFeatureTagStore, IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { IBaseEvent, IEventList } from '../types/events';
import { SearchEventsSchema } from '../openapi/spec/search-events-schema';

export default class EventService {
    private logger: Logger;

    private eventStore: IEventStore;

    private featureTagStore: IFeatureTagStore;

    constructor(
        {
            eventStore,
            featureTagStore,
        }: Pick<IUnleashStores, 'eventStore' | 'featureTagStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/event-service.ts');
        this.eventStore = eventStore;
        this.featureTagStore = featureTagStore;
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

    async storeEvent(event: IBaseEvent): Promise<void> {
        if (event.featureName && !event.tags) {
            const tags = await this.featureTagStore.getAllTagsForFeature(
                event.featureName,
            );
            return this.eventStore.store({ ...event, tags });
        }
        return this.eventStore.store(event);
    }

    async storeEvents(events: IBaseEvent[]): Promise<void> {
        const featureNames: string[] = events
            .map((event) => event.featureName)
            .filter(
                (featureName): featureName is string =>
                    featureName !== undefined,
            );

        if (featureNames.length) {
            const tags = await this.featureTagStore.getAllByFeatures(
                featureNames,
            );

            const eventsWithTags = events.map((event) => ({
                ...event,
                tags:
                    event.tags ||
                    tags
                        .filter((tag) => tag.featureName === event.featureName)
                        .map((tag) => ({
                            value: tag.tagValue,
                            type: tag.tagType,
                        })),
            }));

            return this.eventStore.batchStore(eventsWithTags);
        }
        return this.eventStore.batchStore(events);
    }
}
