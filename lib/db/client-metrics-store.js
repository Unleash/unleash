'use strict';

const logger = require('../logger');

const { EventEmitter } = require('events');

const TEN_SECONDS = 10 * 1000;

class ClientMetricsStore extends EventEmitter {

    constructor (metricsDb, pollInterval = TEN_SECONDS) {
        super();
        this.metricsDb = metricsDb;
        this.highestIdSeen = 0;

        // Build internal state
        metricsDb.getMetricsLastHour()
            .then((metrics) => this._emitMetrics(metrics))
            .then(() => this._startPoller(pollInterval))
            .then(() => this.emit('ready'))
            .catch((err) => logger.error(err));
    }

    _startPoller (pollInterval) {
        this.timer = setInterval(() => this._fetchNewAndEmit(), pollInterval);
        this.timer.unref();
    }

    _fetchNewAndEmit () {
        this.metricsDb.getNewMetrics(this.highestIdSeen)
            .then((metrics) => this._emitMetrics(metrics));
    }

    _emitMetrics (metrics) {
        if (metrics && metrics.length > 0) {
            this.highestIdSeen = metrics[metrics.length - 1].id;
            metrics.forEach(m => this.emit('metrics', m.metrics));
        }
    }

    // Insert new client metrics
    insert (metrics) {
        return this.metricsDb.insert(metrics);
    }

    destroy () {
        try {
            clearInterval(this.timer);
        } catch (e) {}
    }
};

module.exports = ClientMetricsStore;
