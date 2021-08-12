import { EventEmitter } from 'events';
import { Knex } from 'knex';
import { DROP_FEATURES } from '../types/events';
import { LogProvider, Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { ICreateEvent, IEvent } from '../types/model';

const EVENT_COLUMNS = [
    'id',
    'type',
    'created_by',
    'created_at',
    'data',
    'tags',
];

export interface IEventTable {
    id: number;
    type: string;
    created_by: string;
    created_at: Date;
    data: any;
    tags: [];
}

const TABLE = 'events';

class EventStore extends EventEmitter implements IEventStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        super();
        this.db = db;
        this.logger = getLogger('lib/db/event-store.ts');
    }

    async store(event: ICreateEvent): Promise<void> {
        try {
            const rows = await this.db(TABLE)
                .insert(this.eventToDbRow(event))
                .returning(EVENT_COLUMNS);
            const savedEvent = this.rowToEvent(rows[0]);
            process.nextTick(() => this.emit(event.type, savedEvent));
        } catch (e) {
            this.logger.warn(`Failed to store event ${e}`);
        }
    }

    async batchStore(events: ICreateEvent[]): Promise<void> {
        try {
            const savedRows = await this.db(TABLE)
                .insert(events.map(this.eventToDbRow))
                .returning(EVENT_COLUMNS);
            const savedEvents = savedRows.map(this.rowToEvent);
            process.nextTick(() =>
                savedEvents.forEach((e) => this.emit(e.type, e)),
            );
        } catch (e) {
            this.logger.warn('Failed to store events');
        }
    }

    async delete(key: number): Promise<void> {
        await this.db(TABLE).where({ id: key }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [key],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(key: number): Promise<IEvent> {
        const row = await this.db(TABLE).where({ id: key }).first();
        return this.rowToEvent(row);
    }

    async getAll(): Promise<IEvent[]> {
        return this.getEvents();
    }

    async getEvents(): Promise<IEvent[]> {
        try {
            const rows = await this.db
                .select(EVENT_COLUMNS)
                .from(TABLE)
                .limit(100)
                .orderBy('created_at', 'desc');

            return rows.map(this.rowToEvent);
        } catch (err) {
            return [];
        }
    }

    async getEventsFilterByType(name: string): Promise<IEvent[]> {
        try {
            const rows = await this.db
                .select(EVENT_COLUMNS)
                .from(TABLE)
                .limit(100)
                .whereRaw("data ->> 'name' = ?", [name])
                .andWhere(
                    'id',
                    '>=',
                    this.db
                        .select(this.db.raw('coalesce(max(id),0) as id'))
                        .from(TABLE)
                        .where({ type: DROP_FEATURES }),
                )
                .orderBy('created_at', 'desc');
            return rows.map(this.rowToEvent);
        } catch (err) {
            return [];
        }
    }

    rowToEvent(row: IEventTable): IEvent {
        return {
            id: row.id,
            type: row.type,
            createdBy: row.created_by,
            createdAt: row.created_at,
            data: row.data,
            tags: row.tags || [],
        };
    }

    eventToDbRow(e: ICreateEvent): any {
        return {
            type: e.type,
            created_by: e.createdBy,
            data: e.data,
            tags: JSON.stringify(e.tags),
        };
    }
}

module.exports = EventStore;
export default EventStore;
