import { IBaseEvent, IEvent } from '../events';
import { Store } from './store';
import { SearchEventsSchema } from '../../openapi/spec/search-events-schema';
import { AnyEventEmitter } from 'lib/util/anyEventEmitter';

export interface IEventStore extends Store<IEvent, number>, AnyEventEmitter {
    store(event: IBaseEvent): Promise<void>;
    batchStore(events: IBaseEvent[]): Promise<void>;
    getEvents(): Promise<IEvent[]>;
    searchEvents(search: SearchEventsSchema): Promise<IEvent[]>;
}
