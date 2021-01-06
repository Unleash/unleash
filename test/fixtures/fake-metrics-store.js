'use strict';

const { EventEmitter } = require('events');

class FakeMetricsStore extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
    }

    getMetricsLastHour() {
        return Promise.resolve([]);
    }

    insert() {
        return Promise.resolve();
    }
}

module.exports = FakeMetricsStore;
