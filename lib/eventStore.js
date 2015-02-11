var util = require('util');
var eventDb = require('./eventDb');
var EventEmitter = require('events').EventEmitter;

function EventStore() {
    EventEmitter.call(this);
}
util.inherits(EventStore, EventEmitter);

EventStore.prototype.create = function(event) {
    var _this = this;
    return eventDb.store(event).then(function() {
        _this.emit(event.type, event);
    });
};

module.exports = new EventStore();