import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import {
    DEFAULT_PROJECT,
    FeatureToggleDTO,
    IContextFieldStore,
    IEnvironmentStore,
    IEventStore,
    IFeatureToggleStore,
    IProjectStore,
    ISegment,
    IStrategyConfig,
    ITagStore,
    IVariant,
} from '../../types';
import { DEFAULT_ENV } from '../../util';
import {
    ContextFieldSchema,
    ImportTogglesSchema,
    UpsertSegmentSchema,
    VariantsSchema,
} from '../../openapi';
import User from '../../types/user';
import { IContextFieldDto } from '../../types/stores/context-field-store';

let app: IUnleashTest;
let db: ITestDb;
let eventStore: IEventStore;
let environmentStore: IEnvironmentStore;
let contextFieldStore: IContextFieldStore;
let projectStore: IProjectStore;
let toggleStore: IFeatureToggleStore;
let tagStore: ITagStore;

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

const createVariants = async (feature: string, variants: IVariant[]) => {
    await app.services.featureToggleService.saveVariantsOnEnv(
        DEFAULT_PROJECT,
        feature,
        DEFAULT_ENV,
        variants,
        new User({ id: 1 }),
    );
};

const createProjects = async (projects: string[] = [DEFAULT_PROJECT]) => {
    await db.stores.environmentStore.create({
        name: DEFAULT_ENV,
        type: 'production',
    });
    for (const project of projects) {
        await db.stores.projectStore.create({
            name: project,
            description: '',
            id: project,
            mode: 'open' as const,
        });
        await app.linkProjectToEnvironment(project, DEFAULT_ENV);
    }
};

const createSegment = (postData: UpsertSegmentSchema): Promise<ISegment> => {
    return app.services.segmentService.create(postData, {
        email: 'test@example.com',
    });
};

const unArchiveFeature = async (featureName: string) => {
    await app.request
        .post(`/api/admin/archive/revive/${featureName}`)
        .set('Content-Type', 'application/json')
        .expect(200);
};

const getContextField = (name: string) =>
    app.request.get(`/api/admin/context/${name}`).expect(200);

beforeAll(async () => {
    db = await dbInit('export_import_api_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    featuresExportImport: true,
                },
            },
        },
        db.rawDatabase,
    );
    eventStore = db.stores.eventStore;
    environmentStore = db.stores.environmentStore;
    projectStore = db.stores.projectStore;
    contextFieldStore = db.stores.contextFieldStore;
    toggleStore = db.stores.featureToggleStore;
    tagStore = db.stores.tagStore;
});

beforeEach(async () => {
    await eventStore.deleteAll();
    await toggleStore.deleteAll();
    await projectStore.deleteAll();
    await environmentStore.deleteAll();
    await tagStore.deleteAll();

    await contextFieldStore.deleteAll();
    await app.createContextField({ name: 'appName' });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

describe('import-export for project-specific segments', () => {
    test('exports features with project-specific-segments', async () => {
        const segmentName = 'my-segment';
        const project = 'with-segments';
        await createProjects([project]);
        const segment = await createSegment({
            name: segmentName,
            project,
            constraints: [],
        });
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
            [],
            project,
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
                    id: segment.id,
                    name: segmentName,
                },
            ],
        });
    });
});

test('exports features', async () => {
    const segmentName = 'my-segment';
    await createProjects();
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
                id: segment.id,
                name: segmentName,
            },
        ],
    });
});

test('exports features by tag', async () => {
    await createProjects();
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
        ['mytag'],
    );
    await createToggle(
        {
            name: 'second_feature',
            description: 'the #1 feature',
        },
        strategy,
        ['anothertag'],
    );
    const { body } = await app.request
        .post('/api/admin/features-batch/export')
        .send({
            tag: 'mytag',
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
    });
});

test('should export custom context fields from strategies and variants', async () => {
    await createProjects();
    const strategyContext = {
        name: 'strategy-context',
        legalValues: [
            { value: 'strategy-context-1' },
            { value: 'strategy-context-2' },
            { value: 'strategy-context-3' },
        ],
    };
    const strategyStickinessContext = {
        name: 'strategy-stickiness',
        legalValues: [
            { value: 'strategy-stickiness-1' },
            { value: 'strategy-stickiness-2' },
        ],
    };
    await createContext(strategyContext);
    await createContext(strategyStickinessContext);
    const strategy = {
        name: 'default',
        parameters: { rollout: '100', stickiness: 'strategy-stickiness' },
        constraints: [
            {
                contextName: strategyContext.name,
                values: ['strategy-context-1', 'strategy-context-2'],
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
    const variantStickinessContext = {
        name: 'variant-stickiness-context',
        legalValues: [
            { value: 'variant-stickiness-context-1' },
            { value: 'variant-stickiness-context-2' },
        ],
    };
    const variantOverridesContext = {
        name: 'variant-overrides-context',
        legalValues: [
            { value: 'variant-overrides-context-1' },
            { value: 'variant-overrides-context-2' },
        ],
    };
    await createContext(variantStickinessContext);
    await createContext(variantOverridesContext);
    await createVariants('first_feature', [
        {
            name: 'irrelevant',
            weight: 1000,
            stickiness: 'variant-stickiness-context',
            weightType: 'variable',
            overrides: [
                {
                    contextName: 'variant-overrides-context',
                    values: ['variant-overrides-context-1'],
                },
            ],
        },
    ]);

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
        contextFields: [
            strategyContext,
            strategyStickinessContext,
            variantOverridesContext,
            variantStickinessContext,
        ],
    });
});

test('should export tags', async () => {
    const featureName = 'first_feature';
    await createProjects();
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

test('returns no features, when no feature was requested', async () => {
    await createProjects();
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

const defaultFeature = 'first_feature';

const variants: VariantsSchema = [
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
const exportedFeature: ImportTogglesSchema['data']['features'][0] = {
    project: 'old_project',
    name: 'first_feature',
};
const anotherExportedFeature: ImportTogglesSchema['data']['features'][0] = {
    project: 'old_project',
    name: 'second_feature',
};
const constraints: ImportTogglesSchema['data']['featureStrategies'][0]['constraints'] =
    [
        {
            values: ['conduit'],
            inverted: false,
            operator: 'IN',
            contextName: 'appName',
            caseInsensitive: false,
        },
    ];
const exportedStrategy: ImportTogglesSchema['data']['featureStrategies'][0] = {
    featureName: defaultFeature,
    id: '798cb25a-2abd-47bd-8a95-40ec13472309',
    name: 'default',
    parameters: {},
    constraints,
};

const tags = [
    {
        featureName: defaultFeature,
        tagType: 'simple',
        tagValue: 'tag1',
    },
    {
        featureName: defaultFeature,
        tagType: 'simple',
        tagValue: 'tag2',
    },
    {
        featureName: defaultFeature,
        tagType: 'special_tag',
        tagValue: 'feature_tagged',
    },
];

const resultTags = [
    { value: 'tag1', type: 'simple' },
    { value: 'tag2', type: 'simple' },
    { value: 'feature_tagged', type: 'special_tag' },
];

const tagTypes = [
    { name: 'bestt', description: 'test' },
    { name: 'special_tag', description: 'this is my special tag' },
    { name: 'special_tag', description: 'this is my special tag' }, // deliberate duplicate
];

const defaultImportPayload: ImportTogglesSchema = {
    data: {
        features: [exportedFeature],
        featureStrategies: [exportedStrategy],
        featureEnvironments: [
            {
                enabled: true,
                environment: 'irrelevant',
                featureName: defaultFeature,
                name: defaultFeature,
                variants,
            },
        ],
        featureTags: tags,
        tagTypes,
        contextFields: [],
        segments: [],
    },
    project: DEFAULT_PROJECT,
    environment: DEFAULT_ENV,
};

const importWithMultipleFeatures: ImportTogglesSchema = {
    data: {
        features: [exportedFeature, anotherExportedFeature],
        featureStrategies: [],
        featureEnvironments: [],
        featureTags: [
            {
                featureName: exportedFeature.name,
                tagType: 'simple',
                tagValue: 'tag1',
            },
            {
                featureName: anotherExportedFeature.name,
                tagType: 'simple',
                tagValue: 'tag1',
            },
        ],
        tagTypes,
        contextFields: [],
        segments: [],
    },
    project: DEFAULT_PROJECT,
    environment: DEFAULT_ENV,
};

const getFeature = async (feature: string) =>
    app.request
        .get(`/api/admin/projects/${DEFAULT_PROJECT}/features/${feature}`)
        .expect(200);

const getFeatureEnvironment = (feature: string) =>
    app.request
        .get(
            `/api/admin/projects/${DEFAULT_PROJECT}/features/${feature}/environments/${DEFAULT_ENV}`,
        )
        .expect(200);

const getTags = (feature: string) =>
    app.request.get(`/api/admin/features/${feature}/tags`).expect(200);

const validateImport = (importPayload: ImportTogglesSchema, status = 200) =>
    app.request
        .post('/api/admin/features-batch/validate')
        .send(importPayload)
        .set('Content-Type', 'application/json')
        .expect(status);

test('import features to existing project and environment', async () => {
    await createProjects();

    await app.importToggles(defaultImportPayload);

    const { body: importedFeature } = await getFeature(defaultFeature);
    expect(importedFeature).toMatchObject({
        name: 'first_feature',
        project: DEFAULT_PROJECT,
        variants,
    });

    const { body: importedFeatureEnvironment } = await getFeatureEnvironment(
        defaultFeature,
    );
    expect(importedFeatureEnvironment).toMatchObject({
        name: defaultFeature,
        environment: DEFAULT_ENV,
        enabled: true,
        strategies: [
            {
                featureName: defaultFeature,
                parameters: {},
                constraints,
                sortOrder: 9999,
                name: 'default',
            },
        ],
    });

    const { body: importedTags } = await getTags(defaultFeature);
    expect(importedTags).toMatchObject({
        tags: resultTags,
    });
});

test('import multiple features with same tag', async () => {
    await createProjects();

    await app.importToggles(importWithMultipleFeatures);

    const { body: tags1 } = await getTags(exportedFeature.name);
    const { body: tags2 } = await getTags(anotherExportedFeature.name);

    expect(tags1).toMatchObject({
        version: 1,
        tags: [{ value: 'tag1', type: 'simple' }],
    });
    expect(tags2).toMatchObject({
        version: 1,
        tags: [{ value: 'tag1', type: 'simple' }],
    });
});

test('importing same JSON should work multiple times in a row', async () => {
    await createProjects();
    await app.importToggles(defaultImportPayload);
    await app.importToggles(defaultImportPayload);

    const { body: importedFeature } = await getFeature(defaultFeature);
    expect(importedFeature).toMatchObject({
        name: 'first_feature',
        project: DEFAULT_PROJECT,
        variants,
    });

    const { body: importedFeatureEnvironment } = await getFeatureEnvironment(
        defaultFeature,
    );

    expect(importedFeatureEnvironment).toMatchObject({
        name: defaultFeature,
        environment: DEFAULT_ENV,
        enabled: true,
        strategies: [
            {
                featureName: defaultFeature,
                parameters: {},
                constraints,
                sortOrder: 9999,
                name: 'default',
            },
        ],
    });
});

test('reject import with unknown context fields', async () => {
    await createProjects();
    const contextField = {
        name: 'ContextField1',
        legalValues: [{ value: 'Value1', description: '' }],
    };
    await app.createContextField(contextField);
    const importPayloadWithContextFields: ImportTogglesSchema = {
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            contextFields: [
                {
                    ...contextField,
                    legalValues: [{ value: 'Value2', description: '' }],
                },
            ],
        },
    };

    const { body } = await app.importToggles(
        importPayloadWithContextFields,
        400,
    );

    expect(body.details[0].description).toMatch(/\bContextField1\b/);
});

test('reject import with unsupported strategies', async () => {
    await createProjects();
    const importPayloadWithContextFields: ImportTogglesSchema = {
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            featureStrategies: [
                { name: 'customStrategy', featureName: 'featureName' },
            ],
        },
    };

    const { body } = await app.importToggles(
        importPayloadWithContextFields,
        400,
    );

    expect(body.details[0].description).toMatch(/\bcustomStrategy\b/);
});

test('validate import data', async () => {
    await createProjects();
    const contextField: IContextFieldDto = {
        name: 'validate_context_field',
        legalValues: [{ value: 'Value1' }],
    };

    const createdContextField: IContextFieldDto = {
        name: 'created_context_field',
        legalValues: [{ value: 'new_value' }],
    };

    await app.createFeature(defaultFeature);
    await app.archiveFeature(defaultFeature);

    await app.createContextField(contextField);
    const importPayloadWithContextFields: ImportTogglesSchema = {
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            featureStrategies: [{ name: 'customStrategy' }],
            segments: [{ id: 1, name: 'customSegment' }],
            contextFields: [
                {
                    ...contextField,
                    legalValues: [{ value: 'Value2' }],
                },
                createdContextField,
            ],
        },
    };

    const { body } = await validateImport(importPayloadWithContextFields, 200);

    expect(body).toMatchObject({
        errors: [
            {
                message:
                    'We detected the following custom strategy in the import file that needs to be created first:',
                affectedItems: ['customStrategy'],
            },
            {
                message:
                    'We detected the following context fields that do not have matching legal values with the imported ones:',
                affectedItems: [contextField.name],
            },
        ],
        warnings: [
            {
                message:
                    'The following features will not be imported as they are currently archived. To import them, please unarchive them first:',
                affectedItems: [defaultFeature],
            },
        ],
        permissions: [],
    });
});

test('should create new context', async () => {
    await createProjects();
    const context = {
        name: 'create-new-context',
        legalValues: [{ value: 'Value1' }],
    };
    const importPayloadWithContextFields: ImportTogglesSchema = {
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            contextFields: [context],
        },
    };

    await app.importToggles(importPayloadWithContextFields);

    const { body } = await getContextField(context.name);
    expect(body).toMatchObject(context);
});

test('should not import archived features tags', async () => {
    await createProjects();
    await app.importToggles(defaultImportPayload);

    await app.archiveFeature(defaultFeature);

    await app.importToggles({
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            featureTags: [
                {
                    featureName: defaultFeature,
                    tagType: 'simple',
                    tagValue: 'tag2',
                },
            ],
        },
    });
    await unArchiveFeature(defaultFeature);

    const { body: importedTags } = await getTags(defaultFeature);
    expect(importedTags).toMatchObject({
        tags: resultTags,
    });
});
