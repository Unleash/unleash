'use strict';

const { EventEmitter } = require('events');

class EventStore extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
        this.events = [];
    }

    store(event) {
        this.events.push(event);
        this.emit(event.type, event);
        return Promise.resolve();
    }

    getEvents() {
        return Promise.resolve(this.events);
    }
}

module.exports = EventStore;
