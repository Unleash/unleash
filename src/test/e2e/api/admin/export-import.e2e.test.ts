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
    ISegment,
    IStrategyConfig,
} from 'lib/types';
import { DEFAULT_ENV } from '../../../../lib/util';
import { IImportDTO } from '../../../../lib/services/export-import-service';
import { ContextFieldSchema } from '../../../../lib/openapi';

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

const defaultContext: ContextFieldSchema = {
    name: 'region',
    description: 'A region',
    legalValues: [
        { value: 'north' },
        { value: 'south', description: 'south-desc' },
    ],
};

const createToggle = async (
    toggle: FeatureToggleDTO,
    strategy: Omit<IStrategyConfig, 'id'> = defaultStrategy,
    tags: string[] = [],
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
    await Promise.all(
        tags.map(async (tag) => {
            return app.services.featureTagService.addTag(
                toggle.name,
                {
                    type: 'simple',
                    value: tag,
                },
                username,
            );
        }),
    );
};

const createContext = async (context: ContextFieldSchema = defaultContext) => {
    await app.request
        .post('/api/admin/context')
        .send(context)
        .set('Content-Type', 'application/json')
        .expect(201);
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
    // await db.stores.projectStore.addEnvironmentToProject(project, environment);
};

const createSegment = (postData: object): Promise<ISegment> => {
    return app.services.segmentService.create(postData, {
        email: 'test@example.com',
    });
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

test('exports features', async () => {
    await createProject('default', 'default');
    const segment = await createSegment({ name: 'S3', constraints: [] });
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
        segments: [segment.id],
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
        featureEnvironments: [
            {
                enabled: false,
                environment: 'default',
                featureName: 'first_feature',
                variants: [],
            },
        ],
    });
});

test('should export custom context fields', async () => {
    await createProject('default', 'default');
    const context = {
        name: 'test-export',
        legalValues: [
            { value: 'estonia' },
            { value: 'norway' },
            { value: 'poland' },
        ],
    };
    await createContext(context);
    const strategy = {
        name: 'default',
        parameters: { rollout: '100', stickiness: 'default' },
        constraints: [
            {
                contextName: context.name,
                values: ['estonia', 'norway'],
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
        featureEnvironments: [
            {
                enabled: false,
                environment: 'default',
                featureName: 'first_feature',
                variants: [],
            },
        ],
        contextFields: [context],
    });
});

test('should export tags', async () => {
    const featureName = 'first_feature';
    await createProject('default', 'default');
    await createToggle(
        {
            name: featureName,
            description: 'the #1 feature',
        },
        defaultStrategy,
        ['tag1'],
    );

    const { body } = await app.request
        .post('/api/admin/features-batch/export')
        .send({
            features: ['first_feature'],
            environment: 'default',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const { name, ...resultStrategy } = defaultStrategy;
    expect(body).toMatchObject({
        features: [
            {
                name: 'first_feature',
            },
        ],
        featureStrategies: [resultStrategy],
        featureEnvironments: [
            {
                enabled: false,
                environment: 'default',
                featureName: 'first_feature',
                variants: [],
            },
        ],
        featureTags: [{ featureName, tagValue: 'tag1' }],
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
    const feature = 'first_feature';
    const project = 'new_project';
    const environment = 'staging';
    const variants = [
        {
            name: 'variantA',
            weight: 500,
            payload: {
                type: 'string',
                value: 'payloadA',
            },
            overrides: [],
            stickiness: 'default',
            weightType: 'variable',
        },
        {
            name: 'variantB',
            weight: 500,
            payload: {
                type: 'string',
                value: 'payloadB',
            },
            overrides: [],
            stickiness: 'default',
            weightType: 'variable',
        },
    ];
    const exportedFeature: FeatureToggle = {
        project: 'old_project',
        name: 'first_feature',
        variants,
    };
    const exportedStrategy: IFeatureStrategy = {
        id: '798cb25a-2abd-47bd-8a95-40ec13472309',
        featureName: feature,
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
            featureEnvironments: [
                {
                    enabled: true,
                    featureName: 'first_feature',
                    environment: 'irrelevant',
                },
            ],
            contextFields: [],
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
        .get(`/api/admin/features/${feature}`)
        .expect(200);
    expect(importedFeature).toMatchObject({
        name: 'first_feature',
        project: project,
        variants,
    });

    const { body: importedFeatureEnvironment } = await app.request
        .get(
            `/api/admin/projects/${project}/features/${feature}/environments/${environment}`,
        )
        .expect(200);

    expect(importedFeatureEnvironment).toMatchObject({
        name: feature,
        environment,
        enabled: true,
        strategies: [
            {
                featureName: feature,
                projectId: project,
                environment: environment,
                parameters: {},
                constraints: [],
                sortOrder: 9999,
                name: 'default',
            },
        ],
    });
});
