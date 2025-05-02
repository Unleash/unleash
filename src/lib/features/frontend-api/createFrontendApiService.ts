import { FrontendApiService } from './frontend-api-service';
import { SegmentReadModel } from '../segment/segment-read-model';
import type ClientMetricsServiceV2 from '../metrics/client-metrics/metrics-service-v2';
import SettingService from '../../services/setting-service';
import SettingStore from '../../db/setting-store';
import { createEventsService, createFakeEventsService } from '../index';
import type ConfigurationRevisionService from '../feature-toggle/configuration-revision-service';
import { GlobalFrontendApiCache } from './global-frontend-api-cache';
import ClientFeatureToggleReadModel from './client-feature-toggle-read-model';
import { FakeSegmentReadModel } from '../segment/fake-segment-read-model';
import FakeSettingStore from '../../../test/fixtures/fake-setting-store';
import FakeClientFeatureToggleReadModel from './fake-client-feature-toggle-read-model';
import type { IUnleashConfig } from '../../types';
import type { Db } from '../../db/db';
import type ClientInstanceService from '../metrics/instance/instance-service';

export const createFrontendApiService = (
    db: Db,
    config: IUnleashConfig,
    // client metrics service needs to be shared because it uses in-memory cache
    clientMetricsServiceV2: ClientMetricsServiceV2,
    configurationRevisionService: ConfigurationRevisionService,
    clientInstanceService: ClientInstanceService,
): FrontendApiService => {
    const segmentReadModel = new SegmentReadModel(db);
    const settingStore = new SettingStore(db, config.getLogger);
    const eventService = createEventsService(db, config);
    const settingService = new SettingService(
        { settingStore },
        config,
        eventService,
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
    return new FrontendApiService(
        config,
        {
            clientMetricsServiceV2,
            settingService,
            clientInstanceService,
        },
        globalFrontendApiCache,
    );
};

export const createFakeFrontendApiService = (
    config: IUnleashConfig,
    clientMetricsServiceV2: ClientMetricsServiceV2,
    configurationRevisionService: ConfigurationRevisionService,
    clientInstanceService: ClientInstanceService,
): FrontendApiService => {
    const segmentReadModel = new FakeSegmentReadModel();
    const settingStore = new FakeSettingStore();
    const eventService = createFakeEventsService(config);
    const settingService = new SettingService(
        { settingStore },
        config,
        eventService,
    );
    const clientFeatureToggleReadModel = new FakeClientFeatureToggleReadModel();
    const globalFrontendApiCache = new GlobalFrontendApiCache(
        config,
        segmentReadModel,
        clientFeatureToggleReadModel,
        configurationRevisionService,
    );
    return new FrontendApiService(
        config,
        {
            clientMetricsServiceV2,
            settingService,
            clientInstanceService,
        },
        globalFrontendApiCache,
    );
};
