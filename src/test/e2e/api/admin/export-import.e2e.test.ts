import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { IEventStore } from 'lib/types/stores/event-store';
import {
    FeatureToggleDTO,
    IEnvironmentStore,
    IFeatureToggleStore,
    IProjectStore,
    ISegment,
    IStrategyConfig,
} from 'lib/types';
import { DEFAULT_ENV } from '../../../../lib/util';
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
    const segmentName = 'my-segment';
    await createProject('default', 'default');
    const segment = await createSegment({ name: segmentName, constraints: [] });
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
            },
        ],
        segments: [
            {
                name: segmentName,
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
            },
        ],
        featureTags: [{ featureName, tagValue: 'tag1' }],
    });
});

test('returns no features, when no feature was requests', async () => {
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

    expect(body.features).toHaveLength(0);
});
