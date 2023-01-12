import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { IEventStore } from 'lib/types/stores/event-store';
import {
    FeatureToggle,
    FeatureToggleDTO,
    IEnvironmentStore,
    IFeatureStrategy,
    IFeatureToggleStore,
    IProjectStore,
    IStrategyConfig,
} from 'lib/types';
import { DEFAULT_ENV } from '../../../../lib/util';
import { IImportDTO } from '../../../../lib/services/export-import-service';

let app: IUnleashTest;
let db: ITestDb;
let eventStore: IEventStore;
let environmentStore: IEnvironmentStore;
let projectStore: IProjectStore;
let toggleStore: IFeatureToggleStore;

const defaultStrategy: IStrategyConfig = {
    name: 'default',
    parameters: {},
    constraints: [],
};

const createToggle = async (
    toggle: FeatureToggleDTO,
    strategy: Omit<IStrategyConfig, 'id'> = defaultStrategy,
    projectId: string = 'default',
    username: string = 'test',
) => {
    await app.services.featureToggleServiceV2.createFeatureToggle(
        projectId,
        toggle,
        username,
    );
    if (strategy) {
        await app.services.featureToggleServiceV2.createStrategy(
            strategy,
            { projectId, featureName: toggle.name, environment: DEFAULT_ENV },
            username,
        );
    }
};

const createProject = async (project: string, environment: string) => {
    await db.stores.environmentStore.create({
        name: environment,
        type: 'production',
    });
    await db.stores.projectStore.create({
        name: project,
        description: '',
        id: project,
    });
    await app.request
        .post(`/api/admin/projects/${project}/environments`)
        .send({
            environment,
        })
        .expect(200);
};

beforeAll(async () => {
    db = await dbInit('export_import_api_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                featuresExportImport: true,
            },
        },
    });
    eventStore = db.stores.eventStore;
    environmentStore = db.stores.environmentStore;
    projectStore = db.stores.projectStore;
    toggleStore = db.stores.featureToggleStore;
});

beforeEach(async () => {
    await eventStore.deleteAll();
    await toggleStore.deleteAll();
    await projectStore.deleteAll();
    await environmentStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

afterEach(async () => {});

test('exports features', async () => {
    await createProject('default', 'default');
    const strategy = {
        name: 'default',
        parameters: { rollout: '100', stickiness: 'default' },
        constraints: [
            {
                contextName: 'appName',
                values: ['test'],
                operator: 'IN' as const,
            },
        ],
    };
    await createToggle(
        {
            name: 'first_feature',
            description: 'the #1 feature',
        },
        strategy,
    );
    await createToggle(
        {
            name: 'second_feature',
            description: 'the #1 feature',
        },
        strategy,
    );
    const { body } = await app.request
        .post('/api/admin/features-batch/export')
        .send({
            features: ['first_feature'],
            environment: 'default',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const { name, ...resultStrategy } = strategy;
    expect(body).toMatchObject({
        features: [
            {
                name: 'first_feature',
            },
        ],
        featureStrategies: [resultStrategy],
    });
});

test('returns all features, when no feature was defined', async () => {
    await createProject('default', 'default');
    await createToggle({
        name: 'first_feature',
        description: 'the #1 feature',
    });
    await createToggle({
        name: 'second_feature',
        description: 'the #1 feature',
    });
    const { body } = await app.request
        .post('/api/admin/features-batch/export')
        .send({
            features: [],
            environment: 'default',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body.features).toHaveLength(2);
});

test('import features to existing project and environment', async () => {
    const project = 'new_project';
    const environment = 'staging';
    const exportedFeature: FeatureToggle = {
        project: 'old_project',
        name: 'first_feature',
    };
    const exportedStrategy: IFeatureStrategy = {
        id: '798cb25a-2abd-47bd-8a95-40ec13472309',
        featureName: 'first_feature',
        projectId: 'old_project',
        environment: 'old_environment',
        strategyName: 'default',
        parameters: {},
        constraints: [],
    };
    const importPayload: IImportDTO = {
        data: {
            features: [exportedFeature],
            featureStrategies: [exportedStrategy],
        },
        project: project,
        environment: environment,
    };
    await createProject(project, environment);

    await app.request
        .post('/api/admin/features-batch/import')
        .send(importPayload)
        .set('Content-Type', 'application/json')
        .expect(201);

    const { body: importedFeature } = await app.request
        .get('/api/admin/features/first_feature')
        .expect(200);
    expect(importedFeature).toMatchObject({
        name: 'first_feature',
        project: project,
    });
    const { body: importedStrategies } = await app.request
        .get(
            `/api/admin/projects/${project}/features/first_feature/environments/${environment}/strategies`,
        )
        .expect(200);

    expect(importedStrategies).toMatchObject([
        {
            name: 'default',
            parameters: {},
            segments: [],
            sortOrder: 9999,
        },
    ]);
});
