var util = require('util');
var EventEmitter = require('events').EventEmitter;

function EventStore() {
    EventEmitter.call(this);
}

util.inherits(EventStore, EventEmitter);

EventStore.prototype.create = function (eventType, user, eventData) {
    var event = {
        id: 1,
        created: "2014-08-01 12:22:00",
        type: eventType,
        user: user,
        data: eventData
    };

    this.emit(event.type, event);
};

module.exports = new EventStore();