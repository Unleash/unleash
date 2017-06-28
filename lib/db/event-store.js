'use strict';

const { EventEmitter } = require('events');

const EVENT_COLUMNS = ['id', 'type', 'created_by', 'created_at', 'data'];

class EventStore extends EventEmitter {
    constructor(db) {
        super();
        this.db = db;
    }

    store(event) {
        return this.db('events')
            .insert({
                type: event.type,
            created_by: event.createdBy, // eslint-disable-line
                data: event.data,
            })
            .then(() => this.emit(event.type, event));
    }

    getEvents() {
        return this.db
            .select(EVENT_COLUMNS)
            .from('events')
            .limit(100)
            .orderBy('created_at', 'desc')
            .map(this.rowToEvent);
    }

    getEventsFilterByName(name) {
        return this.db
            .select(EVENT_COLUMNS)
            .from('events')
            .limit(100)
            .whereRaw("data ->> 'name' = ?", [name])
            .orderBy('created_at', 'desc')
            .map(this.rowToEvent);
    }

    rowToEvent(row) {
        return {
            id: row.id,
            type: row.type,
            createdBy: row.created_by,
            createdAt: row.created_at,
            data: row.data,
        };
    }
}

module.exports = EventStore;
