var util = require('util'),
    eventDb = require('./eventDb'),
    EventEmitter = require('events').EventEmitter;

function EventStore() {
    EventEmitter.call(this);
}
util.inherits(EventStore, EventEmitter);

EventStore.prototype.create = function (event) {
    var that = this;
    return eventDb.store(event).then(function() {
        that.emit(event.type, event);
    });
};

module.exports = new EventStore();