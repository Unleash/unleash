'use strict';

const POLL_INTERVAL = 10000;

module.exports = class UnleashClientMetrics {
    constructor (metricsDb) {
        this.metricsDb = metricsDb;
        this.metrics = [];
        this.highestIdSeen = 0;
        metricsDb.getMetricsLastWeek().then(metrics => {
            this.addMetrics(metrics);
            this.startPoller();
        });
    }

    addMetrics (metrics) {
        metrics.forEach(m => this.metrics.push(m));
        if (this.metrics && this.metrics.length > 0) {
            this.highestIdSeen = this.metrics[this.metrics.length - 1].id;
        }
    }

    startPoller () {
        setInterval(() => {
            this.metricsDb.getNewMetrics(this.highestIdSeen)
                .then(metrics => this.addMetrics(metrics));
        }, POLL_INTERVAL).unref();
    }

    getMetrics () {
        return this.metrics;
    }

    insert (metrics) {
        this.metricsDb.insert(metrics).then(() => console.log('new metrics inserted!'));
    }
};
