import {
    type IApiUser,
    type IUnleashConfig,
    type IUnleashStores,
    TEST_AUDIT_USER,
} from '../../types';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import type { FrontendApiService } from './frontend-api-service';
import { createFrontendApiService } from './createFrontendApiService';
import { createLastSeenService } from '../metrics/last-seen/createLastSeenService';
import ClientMetricsServiceV2 from '../metrics/client-metrics/metrics-service-v2';
import ConfigurationRevisionService from '../feature-toggle/configuration-revision-service';
import getLogger from '../../../test/fixtures/no-logger';
import { createTestConfig } from '../../../test/config/test-config';
import { ApiTokenType } from '../../types/models/api-token';
import type FeatureToggleService from '../feature-toggle/feature-toggle-service';
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

const createProject = async (project: string) => {
    await stores.projectStore.create({
        name: project,
        description: '',
        id: project,
    });
    await stores.projectStore.addEnvironmentToProject(project, 'development');
    await stores.projectStore.addEnvironmentToProject(project, 'production');
};

const createEnvironment = async (environment: string) => {
    await stores.environmentStore.create({ name: environment, type: 'test' });
};

const createFeature = async (project: string, featureName: string) => {
    await featureToggleService.createFeatureToggle(
        project,
        { name: featureName, description: '' },
        TEST_AUDIT_USER,
    );
};

const enableFeature = async (
    project: string,
    featureName: string,
    environment: string,
) => {
    await featureToggleService.unprotectedUpdateEnabled(
        project,
        featureName,
        environment,
        true,
        TEST_AUDIT_USER,
    );
};

test('Compare Frontend API implementations', async () => {
    const projectA = 'projectA';
    const projectB = 'projectB';

    await createEnvironment('development');
    await createEnvironment('production');

    await createProject(projectA);
    await createProject(projectB);

    await createFeature(projectA, 'featureA'); // include
    await createFeature(projectA, 'featureB'); // another env
    await createFeature(projectA, 'featureC'); // not enabled
    await createFeature(projectA, 'featureD'); // include
    await enableFeature(projectA, 'featureA', 'development');
    await enableFeature(projectA, 'featureD', 'development');
    await enableFeature(projectA, 'featureB', 'production');

    await createFeature(projectB, 'featureE'); // another project
    await enableFeature(projectB, 'featureE', 'development');

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
            projects: [projectA],
            environment: 'development',
            type: ApiTokenType.FRONTEND,
        } as IApiUser,
        { sessionId: '1234' },
    );

    const newFeatures = await frontendApiService.getNewFrontendApiFeatures(
        {
            projects: [projectA],
            environment: 'development',
            type: ApiTokenType.FRONTEND,
        } as IApiUser,
        { sessionId: '1234' },
    );

    expect(proxyRepositoriesCount).toBe(1);
    expect(frontendRepositoriesCount).toBe(1);
    expect(oldFeatures).toEqual(newFeatures);
    expect(newFeatures.length).toBe(2);
});
