import { register } from 'prom-client';
import EventEmitter from 'events';
import type { IEventStore } from './types/stores/event-store.js';
import { createTestConfig } from '../test/config/test-config.js';
import {
    CLIENT_REGISTERED,
    DB_TIME,
    EXCEEDS_LIMIT,
    FUNCTION_TIME,
    REQUEST_TIME,
} from './metric-events.js';
import {
    CLIENT_METRICS,
    CLIENT_REGISTER,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_UPDATED,
    PROJECT_ENVIRONMENT_REMOVED,
} from './events/index.js';
import {
    createMetricsMonitor,
    registerPrometheusMetrics,
    registerPrometheusPostgresMetrics,
} from './metrics.js';
import createStores from '../test/fixtures/store.js';
import { InstanceStatsService } from './features/instance-stats/instance-stats-service.js';
import VersionService from './services/version-service.js';
import { createFakeGetActiveUsers } from './features/instance-stats/getActiveUsers.js';
import { createFakeGetProductionChanges } from './features/instance-stats/getProductionChanges.js';
import type {
    IEnvironmentStore,
    IFeatureLifecycleReadModel,
    IFeatureLifecycleStore,
    IUnleashStores,
} from './types/index.js';
import FakeEnvironmentStore from './features/project-environments/fake-environment-store.js';
import { SchedulerService } from './services/index.js';
import noLogger from '../test/fixtures/no-logger.js';
import getLogger from '../test/fixtures/no-logger.js';
import dbInit, { type ITestDb } from '../test/e2e/helpers/database-init.js';
import { FeatureLifecycleStore } from './features/feature-lifecycle/feature-lifecycle-store.js';
import { FeatureLifecycleReadModel } from './features/feature-lifecycle/feature-lifecycle-read-model.js';
import { createFakeGetLicensedUsers } from './features/instance-stats/getLicensedUsers.js';
import { createFakeGetEdgeInstances } from './features/instance-stats/getEdgeInstances.js';

const monitor = createMetricsMonitor();
const eventBus = new EventEmitter();
const prometheusRegister = register;
let eventStore: IEventStore;
let environmentStore: IEnvironmentStore;
let statsService: InstanceStatsService;
let stores: IUnleashStores;
let schedulerService: SchedulerService;
let featureLifeCycleStore: IFeatureLifecycleStore;
let featureLifeCycleReadModel: IFeatureLifecycleReadModel;
let db: ITestDb;
let refreshDbMetrics: () => Promise<void>;

beforeAll(async () => {
    const config = createTestConfig({
        server: {
            serverMetrics: true,
        },
    });
    stores = createStores();
    eventStore = stores.eventStore;
    environmentStore = new FakeEnvironmentStore();
    stores.environmentStore = environmentStore;
    const versionService = new VersionService(stores, config);
    db = await dbInit('metrics_test', getLogger);

    featureLifeCycleReadModel = new FeatureLifecycleReadModel(db.rawDatabase);
    stores.featureLifecycleReadModel = featureLifeCycleReadModel;
    featureLifeCycleStore = new FeatureLifecycleStore(db.rawDatabase, eventBus);
    stores.featureLifecycleStore = featureLifeCycleStore;

    statsService = new InstanceStatsService(
        stores,
        config,
        versionService,
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
        createFakeGetLicensedUsers(),
        createFakeGetEdgeInstances(),
    );

    schedulerService = new SchedulerService(
        noLogger,
        {
            isMaintenanceMode: () => Promise.resolve(false),
        },
        eventBus,
    );

    const { collectAggDbMetrics, collectStaticCounters } =
        registerPrometheusMetrics(
            config,
            stores,
            '4.0.0',
            eventBus,
            statsService,
        );
    refreshDbMetrics = collectAggDbMetrics;
    await collectStaticCounters();
});

afterAll(async () => {
    schedulerService.stop();
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
        /http_request_duration_milliseconds\{quantile="0\.99",path="somePath",method="GET",status="200",appName="undefined"\}.*1337/,
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
        /feature_toggle_update_total\{toggle="TestToggle",project="default",environment="n\/a",environmentType="n\/a",action="updated"\} 1/,
    );
});

test('should set environmentType when toggle is flipped', async () => {
    await environmentStore.create({
        name: 'testEnvironment',
        enabled: true,
        type: 'testType',
        sortOrder: 1,
    });
    stores.eventStore.emit(FEATURE_ENVIRONMENT_ENABLED, {
        featureName: 'TestToggle',
        project: 'default',
        environment: 'testEnvironment',
        data: { name: 'TestToggle' },
    });

    // Wait for event to be processed, not nice, but it works.
    await new Promise((done) => {
        setTimeout(done, 1);
    });
    const metrics = await prometheusRegister.metrics();

    expect(metrics).toMatch(
        /feature_toggle_update_total\{toggle="TestToggle",project="default",environment="testEnvironment",environmentType="testType",action="updated"\} 1/,
    );
});

test('should collect metrics for client metric reports', async () => {
    eventBus.emit(CLIENT_METRICS, [
        {
            featureName: 'TestToggle',
            yes: 10,
            no: 5,
        },
    ]);

    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(
        /feature_toggle_usage_total\{toggle="TestToggle",active="true",appName="undefined"\} 10\nfeature_toggle_usage_total\{toggle="TestToggle",active="false",appName="undefined"\} 5/,
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
        /db_query_duration_seconds\{quantile="0\.99",store="foo",action="bar"\} 0.1337/,
    );
});

test('should collect metrics for function timings', async () => {
    eventBus.emit(FUNCTION_TIME, {
        functionName: 'getToggles',
        className: 'ToggleService',
        time: 0.1337,
    });

    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(
        /function_duration_seconds\{quantile="0\.99",functionName="getToggles",className="ToggleService"\} 0.1337/,
    );
});

test('should collect metrics for feature flag size', async () => {
    await refreshDbMetrics();
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggles_total\{version="(.*)"\} 0/);
});

test('should collect metrics for archived feature flag size', async () => {
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_toggles_archived_total 0/);
});

test('should collect metrics for total client apps', async () => {
    await refreshDbMetrics();
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/client_apps_total\{range="(.*)"\} 0/);
});

test('Should collect metrics for database', async () => {
    registerPrometheusPostgresMetrics(db.rawDatabase, eventBus, '15.0.0');
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
        sdkName: 'unleash-client-node',
        sdkVersion: '3.2.5',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkName: 'unleash-client-node',
        sdkVersion: '3.2.5',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkName: 'unleash-client-node',
        sdkVersion: '3.2.5',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkName: 'unleash-client-java',
        sdkVersion: '5.0.0',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkName: 'unleash-client-java',
        sdkVersion: '5.0.0',
    });
    eventStore.emit(CLIENT_REGISTER, {
        sdkName: 'unleash-client-java',
        sdkVersion: '5.0.0',
    });
    const metrics = await prometheusRegister.getSingleMetricAsString(
        'client_sdk_versions',
    );
    expect(metrics).toMatch(
        /client_sdk_versions\{sdk_name="unleash-client-node",sdk_version="3\.2\.5"\,platform_name=\"not-set\",platform_version=\"not-set\",yggdrasil_version=\"not-set\",spec_version=\"not-set\"} 3/,
    );
    expect(metrics).toMatch(
        /client_sdk_versions\{sdk_name="unleash-client-java",sdk_version="5\.0\.0"\,platform_name=\"not-set\",platform_version=\"not-set\",yggdrasil_version=\"not-set\",spec_version=\"not-set\"} 3/,
    );
    eventStore.emit(CLIENT_REGISTER, {
        sdkName: 'unleash-client-node',
        sdkVersion: '3.2.5',
    });
    const newmetrics = await prometheusRegister.getSingleMetricAsString(
        'client_sdk_versions',
    );
    expect(newmetrics).toMatch(
        /client_sdk_versions\{sdk_name="unleash-client-node",sdk_version="3\.2\.5"\,platform_name=\"not-set\",platform_version=\"not-set\",yggdrasil_version=\"not-set\",spec_version=\"not-set\"} 4/,
    );
});

test('Should register intervals when client registered', async () => {
    eventBus.emit(CLIENT_REGISTERED, {
        appName: 'unleash-client-node',
        environment: 'development',
        interval: '15',
    });

    const metrics = await prometheusRegister.getSingleMetricAsString(
        'client_registration_total',
    );
    expect(metrics).toMatch(
        /client_registration_total{appName=\"unleash-client-node\",environment=\"development\",interval=\"15\"} 1/,
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

test('should collect metrics for project disabled numbers', async () => {
    eventStore.emit(PROJECT_ENVIRONMENT_REMOVED, {
        project: 'default',
        environment: 'staging',
        createdBy: 'Jay',
        createdByUserId: 26,
    });

    const recordedMetric = await prometheusRegister.getSingleMetricAsString(
        'project_environments_disabled',
    );
    expect(recordedMetric).toMatch(
        /project_environments_disabled{project_id=\"default\"} 1/,
    );
});

test('should collect metrics for lifecycle', async () => {
    await db.stores.featureToggleStore.create('default', {
        name: 'my_feature_b',
        createdByUserId: 9999,
    });
    await featureLifeCycleStore.insert([
        {
            feature: 'my_feature_b',
            stage: 'initial',
        },
    ]);
    const stageCount = await featureLifeCycleReadModel.getStageCountByProject();
    const stageDurations =
        await featureLifeCycleReadModel.getAllWithStageDuration();
    expect(stageCount).toHaveLength(1);
    expect(stageDurations).toHaveLength(1);

    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/feature_lifecycle_stage_duration/);
    expect(metrics).toMatch(/feature_lifecycle_stage_count_by_project/);
    expect(metrics).toMatch(/feature_lifecycle_stage_entered/);
});

test('should collect limit exceeded metrics', async () => {
    eventBus.emit(EXCEEDS_LIMIT, {
        resource: 'feature flags',
        limit: '5000',
    });

    const recordedMetric = await prometheusRegister.getSingleMetricAsString(
        'exceeds_limit_error',
    );
    expect(recordedMetric).toMatch(
        /exceeds_limit_error{resource=\"feature flags\",limit=\"5000\"} 1/,
    );
});

test('should collect traffic_total metrics', async () => {
    const recordedMetric =
        await prometheusRegister.getSingleMetricAsString('traffic_total');
    expect(recordedMetric).toMatch(/traffic_total 0/);
});

test('should collect licensed_users metrics', async () => {
    const recordedMetric =
        await prometheusRegister.getSingleMetricAsString('licensed_users');
    expect(recordedMetric).toMatch(/licensed_users 0/);
});
