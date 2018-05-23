'use strict';

const events = require('./events');
const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} = require('./event-type');

exports.startMonitoring = (enable, eventBus, eventStore) => {
    if (!enable) {
        return;
    }

    const client = require('prom-client');
    const gcStats = require('prometheus-gc-stats');

    client.collectDefaultMetrics();
    gcStats()();

    const requestDuration = new client.Summary({
        name: 'http_request_duration_milliseconds',
        help: 'App response time',
        labelNames: ['path', 'method', 'status'],
        percentiles: [0.1, 0.5, 0.9, 0.99],
    });
    const featureToggleUpdateTotal = new client.Counter({
        name: 'feature_toggle_update_total',
        help: 'Number of times a toggle has  been updated',
        labelNames: ['toggle'],
    });

    eventBus.on(events.REQUEST_TIME, ({ path, method, time, statusCode }) => {
        requestDuration.labels(path, method, statusCode).observe(time);
    });

    eventStore.on(FEATURE_CREATED, ({ data }) => {
        featureToggleUpdateTotal.labels(data.name).inc();
    });
    eventStore.on(FEATURE_UPDATED, ({ data }) => {
        featureToggleUpdateTotal.labels(data.name).inc();
    });
    eventStore.on(FEATURE_ARCHIVED, ({ data }) => {
        featureToggleUpdateTotal.labels(data.name).inc();
    });
    eventStore.on(FEATURE_REVIVED, ({ data }) => {
        featureToggleUpdateTotal.labels(data.name).inc();
    });
};
