'use strict';

const { DROP_FEATURES } = require('../event-type');
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
                data: JSON.stringify(event.data),
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
            .where('data', 'like', `%{"name":"${name}"%`) // TODO: This opens things up to a sql injection attack. Figure out better cross-platform way of searching.
            .andWhere(
                'id',
                '>=',
                this.db
                    .select(this.db.raw('coalesce(max(id),0) as id'))
                    .from('events')
                    .where({ type: DROP_FEATURES })
            )
            .orderBy('created_at', 'desc')
            .map(this.rowToEvent);
    }

    rowToEvent(row) {
        return {
            id: row.id,
            type: row.type,
            createdBy: row.created_by,
            createdAt: row.created_at,
            data: JSON.parse(row.data),
        };
    }
}

module.exports = EventStore;
