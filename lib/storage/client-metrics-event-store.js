'use strict';

const { EventEmitter } = require('events');
const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');

const { TEN_SECONDS } = require('./utils/const/timings');

class ClientMetricsEventStore extends EventEmitter {
    constructor(metricsDb, eventBus, getLogger, pollInterval = TEN_SECONDS) {
        super();
        this.logger = getLogger('client-metrics-event-store.js');
        this.metricsDb = metricsDb;
        this.eventBus = eventBus;
        this.highestIdSeen = 0;

        this._init(pollInterval);
    }

    async _init(pollInterval) {
        try {
            const metrics = await this.metricsDb.getMetricsLastHour();
            this._emitMetrics(metrics);
        } catch (err) {
            this.logger.error('Error fetching metrics last hour', err);
        }
        this._startPoller(pollInterval);
        this.emit('ready');
    }

    _startPoller(pollInterval) {
        this.timer = setInterval(() => this._fetchNewAndEmit(), pollInterval);
        this.timer.unref();
    }

    _fetchNewAndEmit() {
        this.metricsDb
            .getNewMetrics(this.highestIdSeen)
            .then(metrics => this._emitMetrics(metrics));
    }

    _emitMetrics(metrics) {
        if (metrics && metrics.length > 0) {
            this.highestIdSeen = metrics[metrics.length - 1].id;
            metrics.forEach(m => this.emit('metrics', m.metrics));
        }
    }

    // Insert new client metrics
    insert(metrics) {
        return this.metricsDb.insert(metrics).then(
            metricsHelper.wrapTimer(this.eventBus, DB_TIME, {
                store: 'metrics',
                action: 'insert',
            })
        );
    }

    destroy() {
        try {
            clearInterval(this.timer);
        } catch (e) {
            // empty
        }
    }
}

module.exports = ClientMetricsEventStore;
