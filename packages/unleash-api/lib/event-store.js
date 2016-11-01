'use strict';

const EventEmitter = require('events').EventEmitter;

module.exports = class EventStore extends EventEmitter {
    constructor (eventDb) {
        super();
        this.eventDb = eventDb;
    }

    create  (event) {
        return this.eventDb.store(event).then(() => this.emit(event.type, event));
    }
};

