import type { IBaseEvent, IEvent } from '../../events/index.js';
import type { Store } from './store.js';
import type { ProjectActivitySchema } from '../../openapi/index.js';
import type EventEmitter from 'events';
import type { IQueryOperations } from '../../features/events/event-store.js';
import type { IQueryParam } from '../../features/feature-toggle/types/feature-toggle-strategies-store-type.js';

export interface IEventSearchParams {
    id?: string;
    groupId?: string;
    project?: string;
    query?: string;
    feature?: string;
    from?: string;
    to?: string;
    createdBy?: string;
    type?: string;
    environment?: string;
    order?: 'asc' | 'desc'; // desc by default
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
    searchEventsCount(
        queryParams: IQueryParam[],
        query?: IEventSearchParams['query'],
    ): Promise<number>;
    searchEvents(
        params: IEventSearchParams,
        queryParams: IQueryParam[],
        options?: { withIp?: boolean },
    ): Promise<IEvent[]>;
    getMaxRevisionId(
        currentMax?: number,
        environment?: string,
    ): Promise<number>;
    getRevisionRange(start: number, end: number): Promise<IEvent[]>;
    query(operations: IQueryOperations[]): Promise<IEvent[]>;
    queryCount(operations: IQueryOperations[]): Promise<number>;
    setCreatedByUserId(batchSize: number): Promise<number | undefined>;
    getEventCreators(): Promise<Array<{ id: number; name: string }>>;
    getProjectRecentEventActivity(
        project: string,
    ): Promise<ProjectActivitySchema>;
}
