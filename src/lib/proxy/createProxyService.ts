import { ProxyService } from './proxy-service';
import { SegmentReadModel } from '../features/segment/segment-read-model';
import ClientMetricsServiceV2 from '../features/metrics/client-metrics/metrics-service-v2';
import {
    createFakeLastSeenService,
    createLastSeenService,
} from '../features/metrics/last-seen/createLastSeenService';
import { ClientMetricsStoreV2 } from '../features/metrics/client-metrics/client-metrics-store-v2';
import SettingService from '../services/setting-service';
import SettingStore from '../db/setting-store';
import {
    createEventsService,
    createFakeEventsService,
    createFakeFeatureToggleService,
    createFeatureToggleService,
} from '../features';
import ConfigurationRevisionService from '../features/feature-toggle/configuration-revision-service';
import EventStore from '../features/events/event-store';
import { GlobalFrontendApiCache } from './global-frontend-api-cache';
import ClientFeatureToggleReadModel from './client-feature-toggle-read-model';
import { FakeSegmentReadModel } from '../features/segment/fake-segment-read-model';
import FakeClientMetricsStoreV2 from '../features/metrics/client-metrics/fake-client-metrics-store-v2';
import FakeSettingStore from '../../test/fixtures/fake-setting-store';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import FakeClientFeatureToggleReadModel from './fake-client-feature-toggle-read-model';
import { IUnleashConfig } from '../types';
import { Db } from '../db/db';

export const createProxyService = (
    db: Db,
    config: IUnleashConfig,
): ProxyService => {
    const segmentReadModel = new SegmentReadModel(db);
    const lastSeenService = createLastSeenService(db, config);
    const clientMetricsStoreV2 = new ClientMetricsStoreV2(
        db,
        config.getLogger,
        config.flagResolver,
    );
    const clientMetricsServiceV2 = new ClientMetricsServiceV2(
        { clientMetricsStoreV2 },
        config,
        lastSeenService,
    );
    const settingStore = new SettingStore(db, config.getLogger);
    const eventService = createEventsService(db, config);
    const settingService = new SettingService(
        { settingStore },
        config,
        eventService,
    );
    // TODO: remove this dependency after we migrate frontend API
    const featureToggleServiceV2 = createFeatureToggleService(db, config);
    const eventStore = new EventStore(
        db,
        config.getLogger,
        config.flagResolver,
    );
    const configurationRevisionService = new ConfigurationRevisionService(
        { eventStore },
        config,
    );
    const clientFeatureToggleReadModel = new ClientFeatureToggleReadModel(
        db,
        config.eventBus,
    );
    const globalFrontendApiCache = new GlobalFrontendApiCache(
        config,
        segmentReadModel,
        clientFeatureToggleReadModel,
        configurationRevisionService,
    );
    return new ProxyService(
        config,
        { segmentReadModel },
        {
            featureToggleServiceV2,
            clientMetricsServiceV2,
            settingService,
            configurationRevisionService,
        },
        globalFrontendApiCache,
    );
};

export const createFakeProxyService = (
    config: IUnleashConfig,
): ProxyService => {
    const segmentReadModel = new FakeSegmentReadModel();
    const lastSeenService = createFakeLastSeenService(config);
    const clientMetricsStoreV2 = new FakeClientMetricsStoreV2();
    const clientMetricsServiceV2 = new ClientMetricsServiceV2(
        { clientMetricsStoreV2 },
        config,
        lastSeenService,
    );
    const settingStore = new FakeSettingStore();
    const eventService = createFakeEventsService(config);
    const settingService = new SettingService(
        { settingStore },
        config,
        eventService,
    );
    // TODO: remove this dependency after we migrate frontend API
    const featureToggleServiceV2 = createFakeFeatureToggleService(config);
    const eventStore = new FakeEventStore();
    const configurationRevisionService = new ConfigurationRevisionService(
        { eventStore },
        config,
    );
    const clientFeatureToggleReadModel = new FakeClientFeatureToggleReadModel();
    const globalFrontendApiCache = new GlobalFrontendApiCache(
        config,
        segmentReadModel,
        clientFeatureToggleReadModel,
        configurationRevisionService,
    );
    return new ProxyService(
        config,
        { segmentReadModel },
        {
            featureToggleServiceV2,
            clientMetricsServiceV2,
            settingService,
            configurationRevisionService,
        },
        globalFrontendApiCache,
    );
};
