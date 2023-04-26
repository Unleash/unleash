import { IEventStore } from '../../lib/types/stores/event-store';
import { IEvent } from '../../lib/types/events';
import { sharedEventEmitter } from '../../lib/util/anyEventEmitter';
import { IQueryOperations } from 'lib/db/event-store';
import { SearchEventsSchema } from '../../lib/openapi';
import EventEmitter from 'events';

class FakeEventStore implements IEventStore {
    events: IEvent[];

    private eventEmitter: EventEmitter = sharedEventEmitter;

    constructor() {
        this.eventEmitter.setMaxListeners(0);
        this.events = [];
    }

    getMaxRevisionId(): Promise<number> {
        return Promise.resolve(1);
    }

    store(event: IEvent): Promise<void> {
        this.events.push(event);
        this.eventEmitter.emit(event.type, event);
        return Promise.resolve();
    }

    batchStore(events: IEvent[]): Promise<void> {
        events.forEach((event) => {
            this.events.push(event);
            this.eventEmitter.emit(event.type, event);
        });
        return Promise.resolve();
    }

    async getEvents(): Promise<IEvent[]> {
        return this.events;
    }

    async delete(key: number): Promise<void> {
        this.events.splice(
            this.events.findIndex((t) => t.id === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.events = [];
    }

    async count(): Promise<number> {
        return Promise.resolve(this.events.length);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filteredCount(search: SearchEventsSchema): Promise<number> {
        return Promise.resolve(0);
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        return this.events.some((e) => e.id === key);
    }

    async get(key: number): Promise<IEvent> {
        return this.events.find((e) => e.id === key)!;
    }

    async getAll(): Promise<IEvent[]> {
        return this.events;
    }

    async searchEvents(): Promise<IEvent[]> {
        throw new Error('Method not implemented.');
    }

    async getForFeatures(
        features: string[],
        environments: string[],
        query: { type: string; projectId: string },
    ): Promise<IEvent[]> {
        return this.events.filter((event) => {
            return (
                event.type === query.type &&
                event.project === query.projectId &&
                features.includes(event.data.featureName) &&
                environments.includes(event.data.environment)
            );
        });
    }

    async query(operations: IQueryOperations[]): Promise<IEvent[]> {
        if (operations) return [];
        return [];
    }

    async queryCount(operations: IQueryOperations[]): Promise<number> {
        if (operations) return 0;
        return 0;
    }

    setMaxListeners(number: number): EventEmitter {
        return this.eventEmitter.setMaxListeners(number);
    }

    on(
        eventName: string | symbol,
        listener: (...args: any[]) => void,
    ): EventEmitter {
        return this.eventEmitter.on(eventName, listener);
    }

    emit(eventName: string | symbol, ...args: any[]): boolean {
        return this.eventEmitter.emit(eventName, ...args);
    }

    off(
        eventName: string | symbol,
        listener: (...args: any[]) => void,
    ): EventEmitter {
        return this.eventEmitter.off(eventName, listener);
    }
}

module.exports = FakeEventStore;
export default FakeEventStore;
