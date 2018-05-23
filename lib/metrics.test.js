'use strict';

const { test } = require('ava');
const { EventEmitter } = require('events');
const eventBus = new EventEmitter();
const eventStore = new EventEmitter();
const { REQUEST_TIME } = require('./events');
const { FEATURE_UPDATED } = require('./event-type');
const { startMonitoring } = require('./metrics');
const { register: prometheusRegister } = require('prom-client');

test.before(() => {
    startMonitoring(true, eventBus, eventStore);
});

test('should collect metrics for requests', t => {
    eventBus.emit(REQUEST_TIME, {
        path: 'somePath',
        method: 'GET',
        statusCode: 200,
        time: 1337,
    });

    const metrics = prometheusRegister.metrics();
    t.regex(
        metrics,
        /http_request_duration_milliseconds{quantile="0\.99",path="somePath",method="GET",status="200"} 1337/
    );
});

test('should collect metrics for updated toggles', t => {
    eventStore.emit(FEATURE_UPDATED, {
        data: { name: 'TestToggle' },
    });

    const metrics = prometheusRegister.metrics();
    t.regex(metrics, /feature_toggle_update_total{toggle="TestToggle"} 1/);
});
