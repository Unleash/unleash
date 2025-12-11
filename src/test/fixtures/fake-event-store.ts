import type { IEventStore } from '../../lib/types/stores/event-store.js';
import type { IBaseEvent, IEvent } from '../../lib/events/index.js';
import { sharedEventEmitter } from '../../lib/util/anyEventEmitter.js';
import type { IQueryOperations } from '../../lib/features/events/event-store.js';
import type { ProjectActivitySchema } from '../../lib/openapi/index.js';
import type EventEmitter from 'events';

class FakeEventStore implements IEventStore {
    events: IEvent[];

    private eventEmitter: EventEmitter = sharedEventEmitter;

    constructor() {
        this.eventEmitter.setMaxListeners(0);
        this.events = [];
    }
    getRevisionRange(_start: number, _end: number): Promise<IEvent[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRecentEventActivity(
        _project: string,
    ): Promise<ProjectActivitySchema> {
        throw new Error('Method not implemented.');
    }

    getEventCreators(): Promise<{ id: number; name: string }[]> {
        throw new Error('Method not implemented.');
    }

    getMaxRevisionId(): Promise<number> {
        return Promise.resolve(1);
    }

    store(event: IBaseEvent): Promise<void> {
        this.events.push({
            ...event,
            id: this.events.length,
            createdAt: new Date(),
        });
        this.eventEmitter.emit(event.type, event);
        return Promise.resolve();
    }

    batchStore(events: IBaseEvent[]): Promise<void> {
        events.forEach((event) => {
            this.events.push({
                ...event,
                id: this.events.length,
                createdAt: new Date(),
            });
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
    searchEventsCount(): Promise<number> {
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

    publishUnannouncedEvents(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setCreatedByUserId(_batchSize: number): Promise<number | undefined> {
        throw new Error('Method not implemented.');
    }
}

export default FakeEventStore;
