'use strict';

const EVENT_COLUMNS = ['id', 'type', 'created_by', 'created_at', 'data'];

module.exports = function (db) {
    function storeEvent (event) {
        return db('events').insert({
            type: event.type,
            created_by: event.createdBy, // eslint-disable-line
            data: event.data,
        });
    }

    function getEvents () {
        return db
            .select(EVENT_COLUMNS)
            .from('events')
            .limit(100)
            .orderBy('created_at', 'desc')
            .map(rowToEvent);
    }

    function getEventsFilterByName (name) {
        return db
        .select(EVENT_COLUMNS)
        .from('events')
        .limit(100)
        .whereRaw('data ->> \'name\' = ?', [name])
        .orderBy('created_at', 'desc')
        .map(rowToEvent);
    }

    function rowToEvent (row) {
        return {
            id: row.id,
            type: row.type,
            createdBy: row.created_by,
            createdAt: row.created_at,
            data: row.data,
        };
    }

    return {
        store: storeEvent,
        getEvents,
        getEventsFilterByName,
    };
};

