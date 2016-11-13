'use strict';

const { EventEmitter } = require('events');

module.exports = class UnleashClientMetrics extends EventEmitter {
    constructor (metricsDb, interval = 10000) {
        super();
        this.interval = interval;
        this.db = metricsDb;
        this.highestIdSeen = 0;
        this.db.getMetricsLastHour().then(metrics => {
            this.addMetrics(metrics);
            this.startPoller();
            this.emit('ready');
        });
        this.timer = null;
    }

    addMetrics (metrics) {
        if (metrics && metrics.length > 0) {
            this.highestIdSeen = metrics[metrics.length - 1].id;
        }
        this.emit('metrics', metrics);
    }

    startPoller () {
        this.timer = setInterval(() => {
            this.db.getNewMetrics(this.highestIdSeen)
                .then(metrics => this.addMetrics(metrics));
        }, this.interval);
        this.timer.unref();
    }

    insert (metrics) {
        return this.db.insert(metrics);
    }

    destroy () {
        try {
            clearTimeout(this.timer);
        } catch (e) {}
    }
};
