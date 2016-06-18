'use strict';
const util = require('util');
const EventEmitter = require('events').EventEmitter;

function EventStore(eventDb) {
    this.eventDb = eventDb;
    EventEmitter.call(this);
}
util.inherits(EventStore, EventEmitter);

EventStore.prototype.create = function (event) {
    return this.eventDb.store(event).then(() => {
        this.emit(event.type, event);
    });
};

module.exports = EventStore;
