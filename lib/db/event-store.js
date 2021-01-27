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

class EventStore extends EventEmitter {
    constructor(db) {
        super();
        this.db = db;
    }

    async store(event) {
        await this.db('events').insert({
            type: event.type,
            created_by: event.createdBy, // eslint-disable-line
            data: event.data,
            tags: event.tags ? JSON.stringify(event.tags) : [],
        });
        this.emit(event.type, event);
    }

    async getEvents() {
        const rows = await this.db
            .select(EVENT_COLUMNS)
            .from('events')
            .limit(100)
            .orderBy('created_at', 'desc');

        return rows.map(this.rowToEvent);
    }

    async getEventsFilterByName(name) {
        const rows = await this.db
            .select(EVENT_COLUMNS)
            .from('events')
            .limit(100)
            .whereRaw("data ->> 'name' = ?", [name])
            .andWhere(
                'id',
                '>=',
                this.db
                    .select(this.db.raw('coalesce(max(id),0) as id'))
                    .from('events')
                    .where({ type: DROP_FEATURES }),
            )
            .orderBy('created_at', 'desc');

        return rows.map(this.rowToEvent);
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
}

module.exports = EventStore;
