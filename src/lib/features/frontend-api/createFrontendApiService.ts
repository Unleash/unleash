import { FrontendApiService } from './frontend-api-service.js';
import { SegmentReadModel } from '../segment/segment-read-model.js';
import type ClientMetricsServiceV2 from '../metrics/client-metrics/metrics-service-v2.js';
import SettingService from '../../services/setting-service.js';
import SettingStore from '../../db/setting-store.js';
import {
    createEventsService,
    createFakeEventsService,
    createFakeFeatureToggleService,
    createFeatureToggleService,
} from '../index.js';
import type ConfigurationRevisionService from '../feature-toggle/configuration-revision-service.js';
import { GlobalFrontendApiCache } from './global-frontend-api-cache.js';
import ClientFeatureToggleReadModel from './client-feature-toggle-read-model.js';
import { FakeSegmentReadModel } from '../segment/fake-segment-read-model.js';
import FakeSettingStore from '../../../test/fixtures/fake-setting-store.js';
import FakeClientFeatureToggleReadModel from './fake-client-feature-toggle-read-model.js';
import type { IUnleashConfig } from '../../types/index.js';
import type { Db } from '../../db/db.js';

export const createFrontendApiService = (
    db: Db,
    config: IUnleashConfig,
    // client metrics service needs to be shared because it uses in-memory cache
    clientMetricsServiceV2: ClientMetricsServiceV2,
    configurationRevisionService: ConfigurationRevisionService,
): FrontendApiService => {
    const segmentReadModel = new SegmentReadModel(db);
    const settingStore = new SettingStore(db, config.getLogger);
    const eventService = createEventsService(db, config);
    const settingService = new SettingService(
        { settingStore },
        config,
        eventService,
    );
    // TODO: remove this dependency after we migrate frontend API
    const featureToggleService = createFeatureToggleService(db, config);
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
    return new FrontendApiService(
        config,
        { segmentReadModel },
        {
            featureToggleService,
            clientMetricsServiceV2,
            settingService,
            configurationRevisionService,
        },
        globalFrontendApiCache,
    );
};

export const createFakeFrontendApiService = (
    config: IUnleashConfig,
    clientMetricsServiceV2: ClientMetricsServiceV2,
    configurationRevisionService: ConfigurationRevisionService,
): FrontendApiService => {
    const segmentReadModel = new FakeSegmentReadModel();
    const settingStore = new FakeSettingStore();
    const eventService = createFakeEventsService(config);
    const settingService = new SettingService(
        { settingStore },
        config,
        eventService,
    );
    // TODO: remove this dependency after we migrate frontend API
    const featureToggleService =
        createFakeFeatureToggleService(config).featureToggleService;
    const clientFeatureToggleReadModel = new FakeClientFeatureToggleReadModel();
    const globalFrontendApiCache = new GlobalFrontendApiCache(
        config,
        segmentReadModel,
        clientFeatureToggleReadModel,
        configurationRevisionService,
    );
    return new FrontendApiService(
        config,
        { segmentReadModel },
        {
            featureToggleService,
            clientMetricsServiceV2,
            settingService,
            configurationRevisionService,
        },
        globalFrontendApiCache,
    );
};
