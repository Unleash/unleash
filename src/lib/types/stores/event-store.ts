import EventEmitter from 'events';
import { IBaseEvent, IEvent } from '../events';
import { Store } from './store';

export interface IEventStore extends Store<IEvent, number>, EventEmitter {
    store(event: IBaseEvent): Promise<void>;
    batchStore(events: IBaseEvent[]): Promise<void>;
    getEvents(): Promise<IEvent[]>;
    getEventsFilterByType(name: string): Promise<IEvent[]>;
    getEventsForFeature(featureName: string): Promise<IEvent[]>;
    getEventsFilterByProject(project: string): Promise<IEvent[]>;
    getLatestId(): Promise<number>;
}
