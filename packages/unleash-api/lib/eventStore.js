var util = require('util');
var EventEmitter = require('events').EventEmitter;

function EventStore(eventDb) {
    this.eventDb = eventDb;
    EventEmitter.call(this);
}
util.inherits(EventStore, EventEmitter);

EventStore.prototype.create = function (event) {
    var that = this;
    return this.eventDb.store(event).then(function() {
        that.emit(event.type, event);
    });
};

module.exports = EventStore;
