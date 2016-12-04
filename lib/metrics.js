'use strict';

const events = require('./events');

exports.startMonitoring = (enable, eventBus) => {
    if (!enable) {
        return;
    }

    const client = require('prom-client');

    const requestDuration = new client.Summary('http_request_duration_milliseconds', 'App response time', ['path', 'method', 'status'], {
        percentiles: [0.1, 0.5, 0.9, 0.99],
    });

    eventBus.on(events.REQUEST_TIME, ({ path, method, time, statusCode }) => {
        requestDuration.labels(path, method, statusCode).observe(time);
    });
};
