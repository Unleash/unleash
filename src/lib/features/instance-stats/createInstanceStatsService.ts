import { InstanceStatsService } from './instance-stats-service.js';
import {
    createFakeGetActiveUsers,
    createGetActiveUsers,
} from './getActiveUsers.js';
import {
    createFakeGetProductionChanges,
    createGetProductionChanges,
} from './getProductionChanges.js';
import type { IUnleashConfig } from '../../types/index.js';
import type { Db } from '../../db/db.js';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store.js';
import { UserStore } from '../users/user-store.js';
import ProjectStore from '../project/project-store.js';
import EnvironmentStore from '../project-environments/environment-store.js';
import StrategyStore from '../../db/strategy-store.js';
import ContextFieldStore from '../context/context-field-store.js';
import GroupStore from '../../db/group-store.js';
import SegmentStore from '../segment/segment-store.js';
import RoleStore from '../../db/role-store.js';
import SettingStore from '../../db/setting-store.js';
import ClientInstanceStore from '../../db/client-instance-store.js';
import { EventStore } from '../events/event-store.js';
import { ApiTokenStore } from '../../db/api-token-store.js';
import { ClientMetricsStoreV2 } from '../metrics/client-metrics/client-metrics-store-v2.js';
import VersionService from '../../services/version-service.js';
import FeatureStrategyStore from '../feature-toggle/feature-toggle-strategies-store.js';
import FakeUserStore from '../../../test/fixtures/fake-user-store.js';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store.js';
import FakeProjectStore from '../../../test/fixtures/fake-project-store.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import FakeGroupStore from '../../../test/fixtures/fake-group-store.js';
import FakeContextFieldStore from '../context/fake-context-field-store.js';
import FakeRoleStore from '../../../test/fixtures/fake-role-store.js';
import FakeClientInstanceStore from '../../../test/fixtures/fake-client-instance-store.js';
import FakeClientMetricsStoreV2 from '../metrics/client-metrics/fake-client-metrics-store-v2.js';
import FakeApiTokenStore from '../../../test/fixtures/fake-api-token-store.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import FakeSettingStore from '../../../test/fixtures/fake-setting-store.js';
import FakeSegmentStore from '../../../test/fixtures/fake-segment-store.js';
import FakeStrategiesStore from '../../../test/fixtures/fake-strategies-store.js';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store.js';
import { FeatureStrategiesReadModel } from '../feature-toggle/feature-strategies-read-model.js';
import { FakeFeatureStrategiesReadModel } from '../feature-toggle/fake-feature-strategies-read-model.js';
import { TrafficDataUsageStore } from '../traffic-data-usage/traffic-data-usage-store.js';
import { FakeTrafficDataUsageStore } from '../traffic-data-usage/fake-traffic-data-usage-store.js';
import {
    createFakeGetLicensedUsers,
    createGetLicensedUsers,
} from './getLicensedUsers.js';
import {
    createFakeGetReadOnlyUsers,
    createGetReadOnlyUsers,
} from './getReadOnlyUsers.js';
import { ReleasePlanStore } from '../release-plans/release-plan-store.js';
import { ReleasePlanTemplateStore } from '../release-plans/release-plan-template-store.js';
import {
    createFakeGetEdgeInstances,
    createGetEdgeInstances,
} from './getEdgeInstances.js';

export const createInstanceStatsService = (db: Db, config: IUnleashConfig) => {
    const { eventBus, getLogger, flagResolver } = config;
    const featureToggleStore = new FeatureToggleStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const userStore = new UserStore(db, getLogger);
    const projectStore = new ProjectStore(db, eventBus, config);
    const environmentStore = new EnvironmentStore(db, eventBus, config);
    const strategyStore = new StrategyStore(db, getLogger);
    const contextFieldStore = new ContextFieldStore(
        db,
        getLogger,
        flagResolver,
    );
    const groupStore = new GroupStore(db);
    const segmentStore = new SegmentStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const roleStore = new RoleStore(db, eventBus, getLogger);
    const settingStore = new SettingStore(db, getLogger);
    const clientInstanceStore = new ClientInstanceStore(
        db,
        eventBus,
        getLogger,
    );
    const eventStore = new EventStore(db, getLogger);
    const apiTokenStore = new ApiTokenStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const clientMetricsStoreV2 = new ClientMetricsStoreV2(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );

    const featureStrategiesReadModel = new FeatureStrategiesReadModel(db);

    const trafficDataUsageStore = new TrafficDataUsageStore(db, getLogger);

    const featureStrategiesStore = new FeatureStrategyStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );

    const releasePlanTemplateStore = new ReleasePlanTemplateStore(db, config);
    const releasePlanStore = new ReleasePlanStore(db, config);
    const instanceStatsServiceStores = {
        featureToggleStore,
        userStore,
        projectStore,
        environmentStore,
        strategyStore,
        contextFieldStore,
        groupStore,
        segmentStore,
        roleStore,
        settingStore,
        clientInstanceStore,
        eventStore,
        apiTokenStore,
        clientMetricsStoreV2,
        featureStrategiesReadModel,
        featureStrategiesStore,
        trafficDataUsageStore,
        releasePlanTemplateStore,
        releasePlanStore,
    };
    const versionServiceStores = { settingStore };
    const getActiveUsers = createGetActiveUsers(db);
    const getProductionChanges = createGetProductionChanges(db);
    const getLicencedUsers = createGetLicensedUsers(db);
    const getReadOnlyUsers = createGetReadOnlyUsers(db);
    const getEdgeInstances = createGetEdgeInstances(db);
    const versionService = new VersionService(versionServiceStores, config);

    const instanceStatsService = new InstanceStatsService(
        instanceStatsServiceStores,
        config,
        versionService,
        getActiveUsers,
        getProductionChanges,
        getLicencedUsers,
        getReadOnlyUsers,
        getEdgeInstances,
    );

    return instanceStatsService;
};

export const createFakeInstanceStatsService = (config: IUnleashConfig) => {
    const { eventBus, getLogger, flagResolver } = config;
    const featureToggleStore = new FakeFeatureToggleStore();
    const userStore = new FakeUserStore();
    const projectStore = new FakeProjectStore();
    const environmentStore = new FakeEnvironmentStore();
    const strategyStore = new FakeStrategiesStore();
    const contextFieldStore = new FakeContextFieldStore();
    const groupStore = new FakeGroupStore();
    const segmentStore = new FakeSegmentStore();
    const roleStore = new FakeRoleStore();
    const settingStore = new FakeSettingStore();
    const clientInstanceStore = new FakeClientInstanceStore();
    const eventStore = new FakeEventStore();
    const apiTokenStore = new FakeApiTokenStore();
    const clientMetricsStoreV2 = new FakeClientMetricsStoreV2();
    const featureStrategiesReadModel = new FakeFeatureStrategiesReadModel();
    const trafficDataUsageStore = new FakeTrafficDataUsageStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const releasePlanTemplateStore = {
        count: () => Promise.resolve(0),
    } as ReleasePlanTemplateStore;
    const releasePlanStore = {
        count: () => Promise.resolve(0),
    } as ReleasePlanStore;
    const instanceStatsServiceStores = {
        featureToggleStore,
        userStore,
        projectStore,
        environmentStore,
        strategyStore,
        contextFieldStore,
        groupStore,
        segmentStore,
        roleStore,
        settingStore,
        clientInstanceStore,
        eventStore,
        apiTokenStore,
        clientMetricsStoreV2,
        featureStrategiesReadModel,
        featureStrategiesStore,
        trafficDataUsageStore,
        releasePlanTemplateStore,
        releasePlanStore,
    };

    const versionServiceStores = { settingStore };
    const getActiveUsers = createFakeGetActiveUsers();
    const getLicensedUsers = createFakeGetLicensedUsers();
    const getReadOnlyUsers = createFakeGetReadOnlyUsers();
    const getProductionChanges = createFakeGetProductionChanges();
    const getEdgeInstances = createFakeGetEdgeInstances();
    const versionService = new VersionService(versionServiceStores, config);

    const instanceStatsService = new InstanceStatsService(
        instanceStatsServiceStores,
        config,
        versionService,
        getActiveUsers,
        getProductionChanges,
        getLicensedUsers,
        getReadOnlyUsers,
        getEdgeInstances,
    );

    return instanceStatsService;
};
