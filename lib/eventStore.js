var util = require('util'),
    eventDb = require('./db/event'),
    EventEmitter = require('events').EventEmitter;

function EventStore() {
    EventEmitter.call(this);
}
util.inherits(EventStore, EventEmitter);

EventStore.prototype.create = function (event) {
    var that = this;
    return eventDb.store(event).then(function() {
        return that.emit(event.type, event);
    });
};

module.exports = new EventStore();
