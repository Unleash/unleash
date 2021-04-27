import EventStore, { IEvent } from '../../lib/db/event-store';
import noLoggerProvider from './no-logger';

class FakeEventStore extends EventStore {
    events: IEvent[];

    constructor() {
        super(undefined, noLoggerProvider);
        this.setMaxListeners(0);
        this.events = [];
    }

    store(event: IEvent): Promise<void> {
        this.events.push(event);
        this.emit(event.type, event);
        return Promise.resolve();
    }

    batchStore(events: IEvent[]): Promise<void> {
        events.forEach(event => {
            this.events.push(event);
            this.emit(event.type, event);
        });
        return Promise.resolve();
    }

    getEvents(): Promise<IEvent[]> {
        return Promise.resolve(this.events);
    }
}

module.exports = FakeEventStore;
export default FakeEventStore;
