import type { IUnleashConfig } from '../../types/option';
import type { IFeatureTagStore, IUnleashStores } from '../../types/stores';
import type { Logger } from '../../logger';
import type { IEventStore } from '../../types/stores/event-store';
import type { IBaseEvent, IEventList } from '../../types/events';
import type { SearchEventsSchema } from '../../openapi/spec/search-events-schema';
import type EventEmitter from 'events';
import type { IApiUser, ITag, IUser } from '../../types';
import { ApiTokenType } from '../../types/models/api-token';
import { EVENTS_CREATED_BY_PROCESSED } from '../../metric-events';

export default class EventService {
    private logger: Logger;

    private eventStore: IEventStore;

    private featureTagStore: IFeatureTagStore;

    private eventBus: EventEmitter;

    constructor(
        {
            eventStore,
            featureTagStore,
        }: Pick<IUnleashStores, 'eventStore' | 'featureTagStore'>,
        { getLogger, eventBus }: Pick<IUnleashConfig, 'getLogger' | 'eventBus'>,
    ) {
        this.logger = getLogger('services/event-service.ts');
        this.eventStore = eventStore;
        this.featureTagStore = featureTagStore;
        this.eventBus = eventBus;
    }

    async getEvents(): Promise<IEventList> {
        const totalEvents = await this.eventStore.count();
        const events = await this.eventStore.getEvents();
        return {
            events,
            totalEvents,
        };
    }

    async searchEvents(search: SearchEventsSchema): Promise<IEventList> {
        const totalEvents = await this.eventStore.filteredCount(search);
        const events = await this.eventStore.searchEvents(search);
        return {
            events,
            totalEvents,
        };
    }

    async onEvent(
        eventName: string | symbol,
        listener: (...args: any[]) => void,
    ): Promise<EventEmitter> {
        return this.eventStore.on(eventName, listener);
    }

    private async enhanceEventsWithTags(
        events: IBaseEvent[],
    ): Promise<IBaseEvent[]> {
        const featureNamesSet = new Set<string>();
        for (const event of events) {
            if (event.featureName && !event.tags) {
                featureNamesSet.add(event.featureName);
            }
        }

        const featureTagsMap: Map<string, ITag[]> = new Map();
        const allTagsInFeatures = await this.featureTagStore.getAllByFeatures(
            Array.from(featureNamesSet),
        );

        for (const tag of allTagsInFeatures) {
            const featureTags = featureTagsMap.get(tag.featureName) || [];
            featureTags.push({ value: tag.tagValue, type: tag.tagType });
            featureTagsMap.set(tag.featureName, featureTags);
        }

        for (const event of events) {
            if (event.featureName && !event.tags) {
                event.tags = featureTagsMap.get(event.featureName);
            }
        }

        return events;
    }

    isAdminToken(user: IUser | IApiUser): boolean {
        return (user as IApiUser)?.type === ApiTokenType.ADMIN;
    }

    async storeEvent(event: IBaseEvent): Promise<void> {
        return this.storeEvents([event]);
    }

    async storeEvents(events: IBaseEvent[]): Promise<void> {
        let enhancedEvents = events;
        for (const enhancer of [this.enhanceEventsWithTags.bind(this)]) {
            enhancedEvents = await enhancer(enhancedEvents);
        }
        return this.eventStore.batchStore(enhancedEvents);
    }

    async setEventCreatedByUserId(): Promise<void> {
        const updated = await this.eventStore.setCreatedByUserId(100);
        if (updated !== undefined) {
            this.eventBus.emit(EVENTS_CREATED_BY_PROCESSED, {
                updated,
            });
        }
    }
}
