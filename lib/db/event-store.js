/* eslint-disable prettier/prettier */
'use strict';

const { DROP_FEATURES } = require('../event-type');
const { EventEmitter } = require('events');
const fromText = require('./json-converter').fromText;

const EVENT_COLUMNS = ['id', 'type', 'created_by', 'created_at', 'data'];

class EventStore extends EventEmitter {
    constructor(db) {
        super();
        this.db = db;
        this.client = this.db.fn.client.config.client;
    }

    store(event) {
        return this.db('events')
            .insert({
                type: event.type,
                created_at: this.db.fn.now(), // eslint-disable-line 
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
            .orderBy('id', 'desc') // When multiple events have the same timestamp, assume later ids are newer
            .map(this.rowToEvent);
    }

    getEventsFilterByName(name) {
        let whereClause;

        if (this.client === 'mysql') {
            whereClause = ["(data ->> '$.name') = ?", [name]];
        } else if (this.client === 'postgresql') {
            whereClause = ["data ->> 'name' = ?", [name]];
        } else if (this.client === 'sqlite3') {
            whereClause = [`data like '%{"name":"${name}"%'`];
        }

        return this.db
            .select(EVENT_COLUMNS)
            .from('events')
            .limit(100)
            .whereRaw(...whereClause)
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
            data: fromText(row.data),
        };
    }
}

module.exports = EventStore;
