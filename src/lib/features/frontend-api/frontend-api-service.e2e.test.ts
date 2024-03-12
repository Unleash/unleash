import { IApiUser, IUnleashConfig, IUnleashStores } from '../../types';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import { FrontendApiService } from './frontend-api-service';
import { createFrontendApiService } from './createFrontendApiService';
import { createLastSeenService } from '../metrics/last-seen/createLastSeenService';
import ClientMetricsServiceV2 from '../metrics/client-metrics/metrics-service-v2';
import ConfigurationRevisionService from '../feature-toggle/configuration-revision-service';
import getLogger from '../../../test/fixtures/no-logger';
import { createTestConfig } from '../../../test/config/test-config';
import { ApiTokenType } from '../../types/models/api-token';
import FeatureToggleService from '../feature-toggle/feature-toggle-service';
import { createFeatureToggleService } from '../feature-toggle/createFeatureToggleService';
import {
    FRONTEND_API_REPOSITORY_CREATED,
    PROXY_REPOSITORY_CREATED,
} from '../../metric-events';

let stores: IUnleashStores;
let db: ITestDb;
let frontendApiService: FrontendApiService;
let featureToggleService: FeatureToggleService;
let configurationRevisionService: ConfigurationRevisionService;
let config: IUnleashConfig;

beforeAll(async () => {
    db = await dbInit('frontend_api_service', getLogger);
    stores = db.stores;
    config = createTestConfig({
        experimental: {
            flags: {
                globalFrontendApiCache: true,
            },
        },
    });

    const lastSeenService = createLastSeenService(db.rawDatabase, config);
    const clientMetricsServiceV2 = new ClientMetricsServiceV2(
        stores,
        config,
        lastSeenService,
    );
    configurationRevisionService = ConfigurationRevisionService.getInstance(
        stores,
        config,
    );
    frontendApiService = createFrontendApiService(
        db.rawDatabase,
        config,
        clientMetricsServiceV2,
        configurationRevisionService,
    );
    featureToggleService = createFeatureToggleService(db.rawDatabase, config);
});

afterAll(async () => {
    await db.destroy();
});
test('Compare Frontend API implementations', async () => {
    const project = 'default';
    const environment = 'default';
    const user = 'user@example.com';
    await featureToggleService.createFeatureToggle(
        project,
        { name: 'enabledFeature', description: '' },
        user,
        1,
    );
    await featureToggleService.createFeatureToggle(
        project,
        { name: 'disabledFeature', description: '' },
        user,
        1,
    );
    await featureToggleService.unprotectedUpdateEnabled(
        project,
        'enabledFeature',
        environment,
        true,
        user,
    );
    await configurationRevisionService.updateMaxRevisionId();

    let proxyRepositoriesCount = 0;
    config.eventBus.on(PROXY_REPOSITORY_CREATED, () => {
        proxyRepositoriesCount++;
    });

    let frontendRepositoriesCount = 0;
    config.eventBus.on(FRONTEND_API_REPOSITORY_CREATED, () => {
        frontendRepositoriesCount++;
    });

    const oldFeatures = await frontendApiService.getFrontendApiFeatures(
        {
            projects: [project],
            environment,
            type: ApiTokenType.FRONTEND,
        } as IApiUser,
        { sessionId: '1234' },
    );

    const newFeatures = await frontendApiService.getNewFrontendApiFeatures(
        {
            projects: [project],
            environment,
            type: ApiTokenType.FRONTEND,
        } as IApiUser,
        { sessionId: '1234' },
    );

    expect(proxyRepositoriesCount).toBe(1);
    expect(frontendRepositoriesCount).toBe(1);
    expect(oldFeatures).toEqual(newFeatures);
});
