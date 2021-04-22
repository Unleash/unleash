import { EventEmitter } from 'events';
import { Knex } from 'knex';
import { DROP_FEATURES } from '../event-type';
import { LogProvider, Logger } from '../logger';

const EVENT_COLUMNS = [
    'id',
    'type',
    'created_by',
    'created_at',
    'data',
    'tags',
];

interface IEventTable {
    id: number;
    type: string;
    created_by: string;
    created_at: Date;
    data: any;
    tags: [];
}

interface ICreateEvent {
    type: string;
    createdBy: string;
    data?: any;
    tags?: Array<string>;
}

export interface IEvent extends ICreateEvent {
    id: number;
    createdAt: Date;
}

const TABLE = 'events';

class EventStore extends EventEmitter {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        super();
        this.db = db;
        this.logger = getLogger('lib/db/event-store.js');
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
                savedEvents.forEach(e => this.emit(e.type, e)),
            );
        } catch (e) {
            this.logger.warn('Failed to store events');
        }
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

    async getEventsFilterByName(name: string): Promise<IEvent[]> {
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
            tags: row.tags,
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
