'use strict';

const POLL_INTERVAL = 10000;
const { EventEmitter } = require('events');

module.exports = class UnleashClientMetricsService extends EventEmitter {
    constructor (metricsDb) {
        super();
        this.metricsDb = metricsDb;
        this.metrics = [];
        this.highestIdSeen = 0;
        this.fetch();
    }

    fetch () {
        return this.metricsDb
            .getNewMetrics(this.highestIdSeen)
            .then(metrics => {
                this.startTimer();
                this.addMetrics(metrics);
                return metrics;
            });
    }

    addMetrics (metrics) {
        metrics.forEach(m => this.metrics.push(m));
        if (this.metrics && this.metrics.length > 0) {
            this.highestIdSeen = this.metrics[this.metrics.length - 1].id;
        }
        this.emit('metrics', metrics);
    }

    startTimer () {
        setInterval(() => this.fetch(), POLL_INTERVAL).unref();
    }

    getMetrics () {
        return this.metrics;
    }

    insert (metrics) {
        return this.metricsDb.insert(metrics);
    }
};
