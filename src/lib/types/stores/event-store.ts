import type { IBaseEvent, IEvent } from '../events';
import type { Store } from './store';
import type { SearchEventsSchema } from '../../openapi/spec/search-events-schema';
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
    filteredCount(search: SearchEventsSchema): Promise<number>;
    searchEvents(search: SearchEventsSchema): Promise<IEvent[]>;
    getMaxRevisionId(currentMax?: number): Promise<number>;
    query(operations: IQueryOperations[]): Promise<IEvent[]>;
    queryCount(operations: IQueryOperations[]): Promise<number>;
    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
}
