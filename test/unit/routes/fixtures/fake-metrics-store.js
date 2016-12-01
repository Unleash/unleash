'use strict';

const { EventEmitter } = require('events');

class FakeMetricsStore extends EventEmitter {
    getMetricsLastHour () {
        return Promise.resolve([]);
    }
    insert () {
        return Promise.resolve();
    } 
}

module.exports = FakeMetricsStore;