'use strict';

const POLL_INTERVAL = 10000;
const { EventEmitter } = require('events');

module.exports = class UnleashClientMetrics extends EventEmitter {
    constructor (metricsDb) {
        super();
        this.db = metricsDb;
        this.highestIdSeen = 0;
        this.db.getMetricsLastWeek().then(metrics => {
            this.addMetrics(metrics);
            this.startPoller();
        });
    }

    addMetrics (metrics) {
        if (metrics && metrics.length > 0) {
            this.highestIdSeen = metrics[metrics.length - 1].id;
        }
        this.emit('metrics', metrics);
    }

    startPoller () {
        setInterval(() => {
            this.db.getNewMetrics(this.highestIdSeen)
                .then(metrics => this.addMetrics(metrics));
        }, POLL_INTERVAL).unref();
    }

    insert (metrics) {
        return this.db.insert(metrics);
    }
};
