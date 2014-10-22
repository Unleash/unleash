var util = require('util');
var EventEmitter = require('events').EventEmitter;
var events = require('./events');

function EventStore() {
    EventEmitter.call(this);
}

util.inherits(EventStore, EventEmitter);

EventStore.prototype.create = function (obj) {
    this.emit(events.featureCreated, obj);
};

module.exports = new EventStore();