'use strict';

const { EventEmitter } = require('events');
const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');

const TEN_SECONDS = 10 * 1000;

class ClientMetricsStore extends EventEmitter {
    constructor(metricsDb, eventBus, getLogger, pollInterval = TEN_SECONDS) {
        super();
        this.logger = getLogger('client-metrics-store.js');
        this.metricsDb = metricsDb;
        this.eventBus = eventBus;
        this.highestIdSeen = 0;

        this.startTimer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'metrics',
                action,
            });

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
    async insert(metrics) {
        const stopTimer = this.startTimer('insert');

        await this.metricsDb.insert(metrics);

        stopTimer();
    }

    destroy() {
        try {
            clearInterval(this.timer);
        } catch (e) {
            // empty
        }
    }
}

module.exports = ClientMetricsStore;
