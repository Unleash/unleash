import { register } from 'prom-client';
import EventEmitter from 'events';
import { createTestConfig } from '../test/config/test-config';
import { REQUEST_TIME, DB_TIME } from './metric-events';
import { FEATURE_UPDATED } from './types/events';
import { createMetricsMonitor } from './metrics';
import createStores from '../test/fixtures/store';

const monitor = createMetricsMonitor();
const eventBus = new EventEmitter();
const prometheusRegister = register;
let stores;
beforeAll(() => {
    const config = createTestConfig({
        server: {
            serverMetrics: true,
        },
    });
    stores = createStores();
    const db = {
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
    };
    // @ts-ignore - We don't want a full knex implementation for our tests, it's enough that it actually yields the numbers we want.
    monitor.startMonitoring(config, stores, '4.0.0', eventBus, db);
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
        /http_request_duration_milliseconds{quantile="0\.99",path="somePath",method="GET",status="200"}.*1337/,
    );
});

test('should collect metrics for updated toggles', async () => {
    stores.eventStore.emit(FEATURE_UPDATED, {
        data: { name: 'TestToggle' },
    });

    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(
        /feature_toggle_update_total{toggle="TestToggle"} 1/,
    );
});

test('should collect metrics for client metric reports', async () => {
    stores.clientMetricsStore.emit('metrics', {
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
        /feature_toggle_usage_total{toggle="TestToggle",active="true",appName="undefined"} 10\nfeature_toggle_usage_total{toggle="TestToggle",active="false",appName="undefined"} 5/,
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
        /db_query_duration_seconds{quantile="0\.99",store="foo",action="bar"} 0.1337/,
    );
});

test('should collect metrics for feature toggle size', async () => {
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggles_total{version="(.*)"} 0/);
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
