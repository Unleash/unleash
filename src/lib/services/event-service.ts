import { IUnleashConfig } from '../types/option';
import { IFeatureTagStore, IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { IBaseEvent, IEventList, IUserEvent } from '../types/events';
import { SearchEventsSchema } from '../openapi/spec/search-events-schema';
import EventEmitter from 'events';
import { ADMIN_TOKEN_USER, IApiUser, ITag, IUser, SYSTEM_USER } from '../types';
import { ApiTokenType } from '../../lib/types/models/api-token';

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

    getUserDetails(user: IUser | IApiUser): {
        createdBy: string;
        createdByUserId: number;
    } {
        return {
            createdBy:
                (user as IUser)?.email ||
                user?.username ||
                (this.isAdminToken(user)
                    ? ADMIN_TOKEN_USER.username
                    : SYSTEM_USER.username),
            createdByUserId:
                (user as IUser)?.id ||
                (user as IApiUser)?.internalAdminTokenUserId ||
                SYSTEM_USER.id,
        };
    }

    /**
     * @deprecated use storeUserEvent instead
     */
    async storeEvent(event: IBaseEvent): Promise<void> {
        return this.storeEvents([event]);
    }

    /**
     * @deprecated use storeUserEvents instead
     */
    async storeEvents(events: IBaseEvent[]): Promise<void> {
        let enhancedEvents = events;
        for (const enhancer of [this.enhanceEventsWithTags.bind(this)]) {
            enhancedEvents = await enhancer(enhancedEvents);
        }
        return this.eventStore.batchStore(enhancedEvents);
    }

    async storeUserEvent(event: IUserEvent): Promise<void> {
        return this.storeUserEvents([event]);
    }

    async storeUserEvents(events: IUserEvent[]): Promise<void> {
        let enhancedEvents = events.map(({ byUser, ...event }) => {
            return {
                ...event,
                ...this.getUserDetails(byUser),
            };
        });
        for (const enhancer of [this.enhanceEventsWithTags.bind(this)]) {
            enhancedEvents = await enhancer(enhancedEvents);
        }
        return this.eventStore.batchStore(enhancedEvents);
    }
}
