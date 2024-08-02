import type { IUnleashConfig } from '../../types/option';
import type { IFeatureTagStore, IUnleashStores } from '../../types/stores';
import type { Logger } from '../../logger';
import type { IEventStore } from '../../types/stores/event-store';
import type { IBaseEvent, IEventList } from '../../types/events';
import type { DeprecatedSearchEventsSchema } from '../../openapi/spec/deprecated-search-events-schema';
import type EventEmitter from 'events';
import type { IApiUser, ITag, IUser } from '../../types';
import { ApiTokenType } from '../../types/models/api-token';
import { EVENTS_CREATED_BY_PROCESSED } from '../../metric-events';
import type { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import { parseSearchOperatorValue } from '../feature-search/search-utils';

export interface IEventSearchParams {
    project?: string;
    query?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    createdBy?: string;
    type?: string;
    offset: number;
    limit: number;
}

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

    async deprecatedSearchEvents(
        search: DeprecatedSearchEventsSchema,
    ): Promise<IEventList> {
        const totalEvents =
            await this.eventStore.deprecatedFilteredCount(search);
        const events = await this.eventStore.deprecatedSearchEvents(search);
        return {
            events,
            totalEvents,
        };
    }

    async searchEvents(search: IEventSearchParams): Promise<IEventList> {
        const queryParams = this.convertToDbParams(search);
        const totalEvents = await this.eventStore.searchEventsCount(
            {
                limit: search.limit,
                offset: search.offset,
                query: search.query,
            },
            queryParams,
        );
        const events = await this.eventStore.searchEvents(
            {
                limit: search.limit,
                offset: search.offset,
                query: search.query,
            },
            queryParams,
        );
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

    convertToDbParams = (params: IEventSearchParams): IQueryParam[] => {
        const queryParams: IQueryParam[] = [];

        if (params.createdAtFrom) {
            queryParams.push({
                field: 'created_at',
                operator: 'IS_ON_OR_AFTER',
                values: [params.createdAtFrom],
            });
        }

        if (params.createdAtTo) {
            queryParams.push({
                field: 'created_at',
                operator: 'IS_BEFORE',
                values: [params.createdAtTo],
            });
        }

        if (params.createdBy) {
            const parsed = parseSearchOperatorValue(
                'created_by',
                params.createdBy,
            );
            if (parsed) queryParams.push(parsed);
        }

        if (params.type) {
            const parsed = parseSearchOperatorValue('type', params.type);
            if (parsed) queryParams.push(parsed);
        }

        ['feature', 'project'].forEach((field) => {
            if (params[field]) {
                const parsed = parseSearchOperatorValue(field, params[field]);
                if (parsed) queryParams.push(parsed);
            }
        });

        return queryParams;
    };
}
