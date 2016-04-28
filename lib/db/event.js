var knex          = require('./dbPool');
var EVENT_COLUMNS = ['id', 'type', 'created_by', 'created_at', 'data'];

function storeEvent(event) {
    return knex('events').insert({
        type: event.type,
        created_by: event.createdBy, // eslint-disable-line
        data: event.data
    });
}

function getEvents() {
    return knex
        .select(EVENT_COLUMNS)
        .from('events')
        .orderBy('created_at', 'desc')
        .map(rowToEvent);
}

function getEventsFilterByName(name) {
    return knex
      .select(EVENT_COLUMNS)
      .from('events')
      .whereRaw("data ->> 'name' = ?", [name])
      .orderBy('created_at', 'desc')
      .map(rowToEvent);
}

function rowToEvent(row) {
    return {
        id: row.id,
        type: row.type,
        createdBy: row.created_by,
        createdAt: row.created_at,
        data: row.data
    };
}

module.exports = {
    store: storeEvent,
    getEvents: getEvents,
    getEventsFilterByName: getEventsFilterByName
};
