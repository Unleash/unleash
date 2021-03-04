'use strict';

const { EventEmitter } = require('events');
const { DROP_FEATURES } = require('../event-type');

const EVENT_COLUMNS = [
    'id',
    'type',
    'created_by',
    'created_at',
    'data',
    'tags',
];

const TABLE = 'events';

class EventStore extends EventEmitter {
    constructor(db, getLogger) {
        super();
        this.db = db;
        this.logger = getLogger('lib/db/event-store.js');
    }

    async store(event) {
        try {
            const rows = await this.db(TABLE)
                .insert({
                    type: event.type,
                created_by: event.createdBy, // eslint-disable-line
                    data: event.data,
                    tags: event.tags ? JSON.stringify(event.tags) : [],
                })
                .returning(EVENT_COLUMNS);
            const savedEvent = this.rowToEvent(rows[0]);
            process.nextTick(() => this.emit(event.type, savedEvent));
        } catch (e) {
            this.logger.warn(`Failed to store event ${e}`);
        }
    }

    async batchStore(events) {
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

    async getEvents() {
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

    async getEventsFilterByName(name) {
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

    rowToEvent(row) {
        return {
            id: row.id,
            type: row.type,
            createdBy: row.created_by,
            createdAt: row.created_at,
            data: row.data,
            tags: row.tags,
        };
    }

    eventToDbRow(e) {
        return {
            type: e.type,
            created_by: e.createdBy,
            data: e.data,
            tags: e.tags ? JSON.stringify(e.tags) : [],
        };
    }
}

module.exports = EventStore;
