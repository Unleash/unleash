var util = require('util');
var EventEmitter = require('events').EventEmitter;
var events = require('./events');

function EventRepository() {
    EventEmitter.call(this);
}

util.inherits(EventRepository, EventEmitter);

EventRepository.prototype.create = function (obj) {
    this.emit(events.featureCreated, obj);
};



module.exports = EventRepository;
