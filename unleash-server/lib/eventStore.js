var Promise = require('bluebird'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

function EventStore() {
    EventEmitter.call(this);
}
util.inherits(EventStore, EventEmitter);

EventStore.prototype.create = function (event) {
    return new Promise(function (resolve) {
        this.emit(event.type, event);
        resolve();
    }.bind(this));
};

module.exports = new EventStore();