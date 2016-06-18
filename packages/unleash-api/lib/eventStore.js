'use strict';
const util = require('util');
const EventEmitter = require('events').EventEmitter;

function EventStore(eventDb) {
    this.eventDb = eventDb;
    EventEmitter.call(this);
}
util.inherits(EventStore, EventEmitter);

EventStore.prototype.create = function (event) {
    const that = this;
    return this.eventDb.store(event).then(() => {
        that.emit(event.type, event);
    });
};

module.exports = EventStore;
