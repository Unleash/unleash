'use strict';;
const { EventEmitter } = require('events');

const eventBus = new EventEmitter();

const eventStore = new EventEmitter();
const clientMetricsStore = new EventEmitter();
const { register: prometheusRegister } = require('prom-client');
const { createTestConfig } = require('../test/config/test-config');
const { REQUEST_TIME, DB_TIME } = require('./events');
const { FEATURE_UPDATED } = require('./event-type');
const { createMetricsMonitor } = require('./metrics');

const monitor = createMetricsMonitor();

beforeAll(() => {
    const featureToggleStore = {
        count: async () => 123,
    };
    const config = createTestConfig({
        server: {
            serverMetrics: true,
        },
    });
    const stores = {
        eventStore,
        clientMetricsStore,
        featureToggleStore,
        db: {
            client: {
                pool: {
                    min: 0,
                    max: 4,
                    numUsed: () => 2,
                    numFree: () => 2,
                    numPendingAcquires: () => 0,
                    numPendingCreates: () => 1,
                },
            },
        },
    };
    monitor.startMonitoring(config, stores, '4.0.0', eventBus);
});

afterAll(() => {
    monitor.stopMonitoring();
});

test('should collect metrics for requests', async () => {
    eventBus.emit(REQUEST_TIME, {
        path: 'somePath',
        method: 'GET',
        statusCode: 200,
        time: 1337,
    });

    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(
        /http_request_duration_milliseconds{quantile="0\.99",path="somePath",method="GET",status="200"} 1337/
    );
});

test('should collect metrics for updated toggles', async () => {
    eventStore.emit(FEATURE_UPDATED, {
        data: { name: 'TestToggle' },
    });

    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggle_update_total{toggle="TestToggle"} 1/);
});

test('should collect metrics for client metric reports', async () => {
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

    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(
        /feature_toggle_usage_total{toggle="TestToggle",active="true",appName="undefined"} 10\nfeature_toggle_usage_total{toggle="TestToggle",active="false",appName="undefined"} 5/
    );
});

test('should collect metrics for db query timings', async () => {
    eventBus.emit(DB_TIME, {
        store: 'foo',
        action: 'bar',
        time: 0.1337,
    });

    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(
        /db_query_duration_seconds{quantile="0\.99",store="foo",action="bar"} 0.1337/
    );
});

test('should collect metrics for feature toggle size', async () => {
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggles_total{version="(.*)"} 123/);
});

test('Should collect metrics for database', async () => {
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/db_pool_max/);
    expect(metrics).toMatch(/db_pool_min/);
    expect(metrics).toMatch(/db_pool_used/);
    expect(metrics).toMatch(/db_pool_free/);
    expect(metrics).toMatch(/db_pool_pending_creates/);
    expect(metrics).toMatch(/db_pool_pending_acquires/);
});
