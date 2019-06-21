'use strict';

const { DROP_FEATURES } = require('../event-type');
const { EventEmitter } = require('events');

const { TABLE, COLUMNS } = require('./utils/const/event-store');
const { rowToEvent } = require('./utils/mappings/event-store');

class EventStore extends EventEmitter {
    constructor(db) {
        super();
        this.db = db;
    }

    store(event) {
        return this.db(TABLE)
            .insert({
                type: event.type,
                created_by: event.createdBy, // eslint-disable-line
                data: event.data,
            })
            .then(() => this.emit(event.type, event));
    }

    getEvents() {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .limit(100)
            .orderBy('created_at', 'desc')
            .map(rowToEvent);
    }

    getEventsFilterByName(name) {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .limit(100)
            .whereRaw("data ->> 'name' = ?", [name])
            .andWhere(
                'id',
                '>=',
                this.db
                    .select(this.db.raw('coalesce(max(id),0) as id'))
                    .from(TABLE)
                    .where({ type: DROP_FEATURES })
            )
            .orderBy('created_at', 'desc')
            .map(rowToEvent);
    }
}

module.exports = EventStore;
