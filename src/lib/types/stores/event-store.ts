import type { IBaseEvent, IEvent } from '../events';
import type { Store } from './store';
import type { DeprecatedSearchEventsSchema } from '../../openapi';
import type EventEmitter from 'events';
import type { IQueryOperations } from '../../features/events/event-store';
import type { IQueryParam } from '../../features/feature-toggle/types/feature-toggle-strategies-store-type';

export interface IEventSearchParams {
    project?: string;
    query?: string;
    feature?: string;
    from?: string;
    to?: string;
    createdBy?: string;
    type?: string;
    offset: number;
    limit: number;
}

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
    searchEventsCount(
        params: IEventSearchParams,
        queryParams: IQueryParam[],
    ): Promise<number>;
    deprecatedSearchEvents(
        search: DeprecatedSearchEventsSchema,
    ): Promise<IEvent[]>;
    searchEvents(
        params: IEventSearchParams,
        queryParams: IQueryParam[],
    ): Promise<IEvent[]>;
    getMaxRevisionId(currentMax?: number): Promise<number>;
    query(operations: IQueryOperations[]): Promise<IEvent[]>;
    queryCount(operations: IQueryOperations[]): Promise<number>;
    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
    getEventCreators(): Promise<Array<{ id: number; name: string }>>;
}
