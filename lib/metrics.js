const events = require('./events');

exports.startMonitoring = (enable, eventBus) => {
    if (!enable) {
        return;
    }

    const client = require('prom-client');
    const toggleFetch = new client.Counter('toggles_fetch_counter', 'Number of fetch toggles request');
    const clientRegister = new client.Counter('client_register_counter', 'Number client register requests');
    const clientMetrics = new client.Counter('client_metrics_counter', 'Number client metrics requests');

    eventBus.on(events.TOGGLES_FETCH, () => {
        toggleFetch.inc();
    });

    eventBus.on(events.CLIENT_REGISTER, () => {
        clientRegister.inc();
    });

    eventBus.on(events.CLIENT_METRICS, () => {
        clientMetrics.inc();
    });
};