const events = require('./events');

exports.startMonitoring = (enable, eventBus) => {
    if (!enable) {
        return;
    }

    const client = require('prom-client');
    const toggleFetch = new client.Counter('toggles_fetch_counter', 'Number of fetch toggles request');
    
    const requestDuration = new client.Summary('http_request_duration_milliseconds', 'App response time', ['uri', 'method'], {
        percentiles: [0.1, 0.5, 0.9, 0.99],
    });
    const requestCount = new client.Counter('http_requests_total', 'HTTP request duration', ['uri', 'method', 'status']);

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

    eventBus.on(events.REQUEST_TIME, (uri, method, time) => {
        requestDuration.labels(uri, method).observe(time);
    });

    eventBus.on(events.REQUEST_STATUS, (uri, method, status) => {
        requestCount.labels(uri, method, status).inc();
    });
};