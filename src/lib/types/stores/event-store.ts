import { IBaseEvent, IEvent } from '../events';
import { Store } from './store';
import { SearchEventsSchema } from '../../openapi/spec/search-events-schema';
import EventEmitter from 'events';
import { IQueryOperations } from 'lib/db/event-store';

export interface IEventStore extends Store<IEvent, number>, EventEmitter {
    store(event: IBaseEvent): Promise<void>;
    batchStore(events: IBaseEvent[]): Promise<void>;
    getEvents(): Promise<IEvent[]>;
    count(): Promise<number>;
    filteredCount(search: SearchEventsSchema): Promise<number>;
    searchEvents(search: SearchEventsSchema): Promise<IEvent[]>;
    query(operations: IQueryOperations[]): Promise<IEvent[]>;
}
