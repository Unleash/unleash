'use strict';

const test = require('ava');
const { EventEmitter } = require('events');

const eventBus = new EventEmitter();
const eventStore = new EventEmitter();
const clientMetricsStore = new EventEmitter();
const { register: prometheusRegister } = require('prom-client');
const { REQUEST_TIME, DB_TIME } = require('./events');
const { FEATURE_UPDATED } = require('./event-type');
const { startMonitoring } = require('./metrics');

test.before(() => {
    const featureToggleStore = {
        count: () => 123,
    };
    const config = {
        serverMetrics: true,
        eventBus,
        stores: {
            eventStore,
            clientMetricsStore,
            featureToggleStore,
        },
        version: '3.4.1',
    };
    startMonitoring(config);
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
        /http_request_duration_milliseconds{quantile="0\.99",path="somePath",method="GET",status="200"} 1337/,
    );
});

test('should collect metrics for updated toggles', t => {
    eventStore.emit(FEATURE_UPDATED, {
        data: { name: 'TestToggle' },
    });

    const metrics = prometheusRegister.metrics();
    t.regex(metrics, /feature_toggle_update_total{toggle="TestToggle"} 1/);
});

test('should collect metrics for client metric reports', t => {
    clientMetricsStore.emit('metrics', {
        bucket: {
            toggles: {
                TestToggle: {
                    yes: 10,
                    no: 5,
                },
            },
        },
    });

    const metrics = prometheusRegister.metrics();
    t.regex(
        metrics,
        /feature_toggle_usage_total{toggle="TestToggle",active="true",appName="undefined"} 10\nfeature_toggle_usage_total{toggle="TestToggle",active="false",appName="undefined"} 5/,
    );
});

test('should collect metrics for db query timings', t => {
    eventBus.emit(DB_TIME, {
        store: 'foo',
        action: 'bar',
        time: 0.1337,
    });

    const metrics = prometheusRegister.metrics();
    t.regex(
        metrics,
        /db_query_duration_seconds{quantile="0\.99",store="foo",action="bar"} 0.1337/,
    );
});

test('should collect metrics for feature toggle size', t => {
    const metrics = prometheusRegister.metrics();
    t.regex(metrics, /feature_toggles_total{version="(.*)"} 123/);
});
