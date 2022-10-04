import { register } from 'prom-client';
import EventEmitter from 'events';
import { IEventStore } from './types/stores/event-store';
import { createTestConfig } from '../test/config/test-config';
import { REQUEST_TIME, DB_TIME } from './metric-events';
import {
    CLIENT_METRICS,
    CLIENT_REGISTER,
    FEATURE_UPDATED,
} from './types/events';
import { createMetricsMonitor } from './metrics';
import createStores from '../test/fixtures/store';

const monitor = createMetricsMonitor();
const eventBus = new EventEmitter();
const prometheusRegister = register;
let eventStore: IEventStore;
let stores;
beforeAll(() => {
    const config = createTestConfig({
        server: {
            serverMetrics: true,
        },
    });
    stores = createStores();
    eventStore = stores.eventStore;
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
        /http_request_duration_milliseconds{quantile="0\.99",path="somePath",method="GET",status="200",appName="undefined"}.*1337/,
    );
});

test('should collect metrics for updated toggles', async () => {
    stores.eventStore.emit(FEATURE_UPDATED, {
        featureName: 'TestToggle',
        project: 'default',
        data: { name: 'TestToggle' },
    });

    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(
        /feature_toggle_update_total{toggle="TestToggle",project="default",environment="default"} 1/,
    );
});

test('should collect metrics for client metric reports', async () => {
    eventBus.emit(CLIENT_METRICS, {
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

test('Should collect metrics for client sdk versions', async () => {
    eventStore.emit(CLIENT_REGISTER, {
        sdkVersion: 'unleash-client-node:3.2.5',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkVersion: 'unleash-client-node:3.2.5',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkVersion: 'unleash-client-node:3.2.5',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkVersion: 'unleash-client-java:5.0.0',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkVersion: 'unleash-client-java:5.0.0',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkVersion: 'unleash-client-java:5.0.0',
    });
    const metrics = await prometheusRegister.getSingleMetricAsString(
        'client_sdk_versions',
    );
    expect(metrics).toMatch(
        /client_sdk_versions\{sdk_name="unleash-client-node",sdk_version="3\.2\.5"} 3/,
    );
    expect(metrics).toMatch(
        /client_sdk_versions\{sdk_name="unleash-client-java",sdk_version="5\.0\.0"} 3/,
    );
    eventStore.emit(CLIENT_REGISTER, {
        sdkVersion: 'unleash-client-node:3.2.5',
    });
    const newmetrics = await prometheusRegister.getSingleMetricAsString(
        'client_sdk_versions',
    );
    expect(newmetrics).toMatch(
        /client_sdk_versions\{sdk_name="unleash-client-node",sdk_version="3\.2\.5"} 4/,
    );
});

test('Should not collect client sdk version if sdkVersion is of wrong format or non-existent', async () => {
    eventStore.emit(CLIENT_REGISTER, { sdkVersion: 'unleash-client-rust' });
    eventStore.emit(CLIENT_REGISTER, {});
    const metrics = await prometheusRegister.getSingleMetricAsString(
        'client_sdk_versions',
    );
    expect(metrics).not.toMatch(/unleash-client-rust/);
});
