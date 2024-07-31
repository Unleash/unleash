import type { IBaseEvent, IEvent } from '../events';
import type { Store } from './store';
import type {
    DeprecatedSearchEventsSchema,
    EventSearchQueryParameters,
} from '../../openapi';
import type EventEmitter from 'events';
import type { IQueryOperations } from '../../features/events/event-store';

export interface IEventStore
    extends Store<IEvent, number>,
        Pick<EventEmitter, 'on' | 'setMaxListeners' | 'emit' | 'off'> {
    publishUnannouncedEvents(): Promise<void>;
    store(event: IBaseEvent): Promise<void>;
    batchStore(events: IBaseEvent[]): Promise<void>;
    getEvents(): Promise<IEvent[]>;
    count(): Promise<number>;
    deprecatedFilteredCount(
        search: DeprecatedSearchEventsSchema,
    ): Promise<number>;
    searchEventsCount(search: EventSearchQueryParameters): Promise<number>;
    deprecatedSearchEvents(
        search: DeprecatedSearchEventsSchema,
    ): Promise<IEvent[]>;
    searchEvents(search: EventSearchQueryParameters): Promise<IEvent[]>;
    getMaxRevisionId(currentMax?: number): Promise<number>;
    query(operations: IQueryOperations[]): Promise<IEvent[]>;
    queryCount(operations: IQueryOperations[]): Promise<number>;
    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
}
