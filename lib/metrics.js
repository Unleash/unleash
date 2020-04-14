'use strict';

const client = require('prom-client');
const events = require('./events');
const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} = require('./event-type');
const { version } = require('./routes/api-def');

const THREE_HOURS = 3 * 60 * 60 * 1000;

exports.startMonitoring = (
    enable,
    eventBus,
    eventStore,
    clientMetricsStore,
    featureToggleStore,
) => {
    if (!enable) {
        return;
    }

    client.collectDefaultMetrics();

    const requestDuration = new client.Summary({
        name: 'http_request_duration_milliseconds',
        help: 'App response time',
        labelNames: ['path', 'method', 'status'],
        percentiles: [0.1, 0.5, 0.9, 0.99],
    });
    const dbDuration = new client.Summary({
        name: 'db_query_duration_seconds',
        help: 'DB query duration time',
        labelNames: ['store', 'action'],
        percentiles: [0.1, 0.5, 0.9, 0.99],
    });
    const featureToggleUpdateTotal = new client.Counter({
        name: 'feature_toggle_update_total',
        help: 'Number of times a toggle has  been updated',
        labelNames: ['toggle'],
    });
    const featureToggleUsageTotal = new client.Counter({
        name: 'feature_toggle_usage_total',
        help: 'Number of times a feature toggle has been used',
        labelNames: ['toggle', 'active', 'appName'],
    });
    const featureTogglesTotal = new client.Gauge({
        name: 'feature_toggles_total',
        help: 'Number of feature toggles',
        labelNames: ['version'],
    });

    async function collectFeatureToggleMetrics() {
        featureTogglesTotal.reset();
        const togglesCount = await featureToggleStore.count();
        featureTogglesTotal.labels(version).set(togglesCount);
    }

    collectFeatureToggleMetrics();
    setInterval(() => collectFeatureToggleMetrics(), THREE_HOURS);

    eventBus.on(events.REQUEST_TIME, ({ path, method, time, statusCode }) => {
        requestDuration.labels(path, method, statusCode).observe(time);
    });

    eventBus.on(events.DB_TIME, ({ store, action, time }) => {
        dbDuration.labels(store, action).observe(time);
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

    clientMetricsStore.on('metrics', m => {
        // eslint-disable-next-line no-restricted-syntax
        for (const [feature, { yes, no }] of Object.entries(m.bucket.toggles)) {
            featureToggleUsageTotal.labels(feature, true, m.appName).inc(yes);
            featureToggleUsageTotal.labels(feature, false, m.appName).inc(no);
        }
    });
};
