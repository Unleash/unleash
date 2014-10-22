var Promise = require('bluebird'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

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

    return new Promise(function (resolve, reject) {
        this.emit(event.type, event);
        resolve();
    }.bind(this));
};

module.exports = new EventStore();