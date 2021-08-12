import EventEmitter from 'events';
import { ICreateEvent, IEvent } from '../model';
import { Store } from './store';

export interface IEventStore extends Store<IEvent, number>, EventEmitter {
    store(event: ICreateEvent): Promise<void>;
    batchStore(events: ICreateEvent[]): Promise<void>;
    getEvents(): Promise<IEvent[]>;
    getEventsFilterByType(name: string): Promise<IEvent[]>;
}
