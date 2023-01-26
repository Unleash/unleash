import { IEventStore } from '../../lib/types/stores/event-store';
import { IEvent } from '../../lib/types/events';
import { AnyEventEmitter } from '../../lib/util/anyEventEmitter';
import { IQueryOperations } from 'lib/db/event-store';

class FakeEventStore extends AnyEventEmitter implements IEventStore {
    events: IEvent[];

    constructor() {
        super();
        this.setMaxListeners(0);
        this.events = [];
    }

    store(event: IEvent): Promise<void> {
        this.events.push(event);
        this.emit(event.type, event);
        return Promise.resolve();
    }

    batchStore(events: IEvent[]): Promise<void> {
        events.forEach((event) => {
            this.events.push(event);
            this.emit(event.type, event);
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

    filteredCount(): Promise<number> {
        throw new Error('Method not implemented');
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        return this.events.some((e) => e.id === key);
    }

    async get(key: number): Promise<IEvent> {
        return this.events.find((e) => e.id === key);
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
}

module.exports = FakeEventStore;
export default FakeEventStore;
