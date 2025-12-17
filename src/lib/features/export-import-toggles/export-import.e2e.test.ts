import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import {
    DEFAULT_PROJECT,
    type FeatureToggleDTO,
    type IContextFieldStore,
    type IEnvironmentStore,
    type IEventStore,
    type IFeatureLinkStore,
    type IFeatureToggleStore,
    type IProjectStore,
    type ISegment,
    type IStrategyConfig,
    type ITagStore,
    type IVariant,
    TEST_AUDIT_USER,
} from '../../types/index.js';
import { DEFAULT_ENV } from '../../util/index.js';
import type {
    ContextFieldSchema,
    ImportTogglesSchema,
    UpsertSegmentSchema,
    VariantsSchema,
} from '../../openapi/index.js';
import type { IContextFieldDto } from '../context/context-field-store-type.js';

let app: IUnleashTest;
let db: ITestDb;
let eventStore: IEventStore;
let environmentStore: IEnvironmentStore;
let contextFieldStore: IContextFieldStore;
let projectStore: IProjectStore;
let toggleStore: IFeatureToggleStore;
let tagStore: ITagStore;
let featureLinkStore: IFeatureLinkStore;

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
        {
            value: 'south',
            description: 'south-desc',
        },
    ],
};

const defaultFeatureName = 'first_feature';

const createFlag = async (
    flag: FeatureToggleDTO,
    strategy: Omit<IStrategyConfig, 'id'> = defaultStrategy,
    tags: string[] = [],
    projectId: string = 'default',
) => {
    await app.services.featureToggleService.createFeatureToggle(
        projectId,
        flag,
        TEST_AUDIT_USER,
    );
    if (strategy) {
        await app.services.featureToggleService.createStrategy(
            strategy,
            {
                projectId,
                featureName: flag.name,
                environment: DEFAULT_ENV,
            },
            TEST_AUDIT_USER,
        );
    }
    await Promise.all(
        tags.map(async (tag) => {
            return app.services.featureTagService.addTag(
                flag.name,
                {
                    type: 'simple',
                    value: tag,
                },
                TEST_AUDIT_USER,
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
    await app.services.featureToggleService.legacySaveVariantsOnEnv(
        DEFAULT_PROJECT,
        feature,
        DEFAULT_ENV,
        variants,
        TEST_AUDIT_USER,
    );
};

const addLink = async (
    feature: string,
    link: { url: string; title: string },
) => {
    await app.services.transactionalFeatureLinkService.createLink(
        DEFAULT_ENV,
        { ...link, featureName: feature },
        TEST_AUDIT_USER,
    );
};

const createProjects = async (
    projects: string[] = [DEFAULT_PROJECT],
    featureLimit = 2,
) => {
    await db.stores.environmentStore.create({
        name: DEFAULT_ENV,
        type: 'production',
    });
    for (const project of projects) {
        const storedProject = {
            name: project,
            description: '',
            id: project,
            mode: 'open' as const,
            featureLimit,
        };
        await db.stores.projectStore.create(storedProject);
        await db.stores.projectStore.update(storedProject);

        await app.linkProjectToEnvironment(project, DEFAULT_ENV);
    }
};

const createSegment = (postData: UpsertSegmentSchema): Promise<ISegment> => {
    return app.services.segmentService.create(postData, TEST_AUDIT_USER);
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
                    featureLinks: true,
                    projectContextFields: true,
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
    featureLinkStore = db.stores.featureLinkStore;
});

beforeEach(async () => {
    await eventStore.deleteAll();
    await toggleStore.deleteAll();
    await projectStore.deleteAll();
    await environmentStore.deleteAll();
    await tagStore.deleteAll();
    await featureLinkStore.deleteAll();

    await contextFieldStore.deleteAll();
    await app.createContextField({ name: 'appName' });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

describe('import-export for project specific segments', () => {
    test('exports features with project specific segments and context fields', async () => {
        const segmentName = 'my-segment';
        const project = 'with-segments';
        await createProjects([project]);
        const segment = await createSegment({
            name: segmentName,
            project,
            constraints: [],
        });
        await app.createContextField({
            name: 'projectAppName',
            project,
        });
        const strategy = {
            name: 'default',
            parameters: {
                rollout: '100',
                stickiness: 'default',
            },
            constraints: [
                {
                    contextName: 'projectAppName',
                    values: ['test'],
                    operator: 'IN' as const,
                },
            ],
            segments: [segment.id],
        };
        await createFlag(
            {
                name: defaultFeatureName,
                description: 'the #1 feature',
            },
            strategy,
            [],
            project,
        );
        const { body } = await app.request
            .post('/api/admin/features-batch/export')
            .send({
                features: [defaultFeatureName],
                environment: DEFAULT_ENV,
            })
            .set('Content-Type', 'application/json')
            .expect(200);

        const { name, ...resultStrategy } = strategy;
        expect(body).toMatchObject({
            features: [
                {
                    name: defaultFeatureName,
                },
            ],
            featureStrategies: [resultStrategy],
            featureEnvironments: [
                {
                    enabled: false,
                    environment: DEFAULT_ENV,
                    featureName: defaultFeatureName,
                },
            ],
            segments: [
                {
                    id: segment.id,
                    name: segmentName,
                },
            ],
            contextFields: [{ name: 'projectAppName', project }],
        });
    });
});

test('exports features', async () => {
    const segmentName = 'my-segment';
    await createProjects();
    const segment = await createSegment({
        name: segmentName,
        constraints: [],
    });
    const strategy = {
        name: 'default',
        parameters: {
            rollout: '100',
            stickiness: 'default',
        },
        constraints: [
            {
                contextName: 'appName',
                values: ['test'],
                operator: 'IN' as const,
            },
        ],
        segments: [segment.id],
    };
    await createFlag(
        {
            name: defaultFeatureName,
            description: 'the #1 feature',
        },
        strategy,
    );
    await createFlag(
        {
            name: 'second_feature',
            description: 'the #1 feature',
        },
        strategy,
    );

    await app.addDependency(defaultFeatureName, 'second_feature');
    await addLink(defaultFeatureName, {
        url: 'http://example1.com',
        title: 'link title 1',
    });
    await addLink(defaultFeatureName, {
        url: 'http://example2.com',
        title: 'link title 2',
    });

    const { body } = await app.request
        .post('/api/admin/features-batch/export')
        .send({
            features: [defaultFeatureName],
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const { name, ...resultStrategy } = strategy;
    expect(body).toMatchObject({
        features: [
            {
                name: defaultFeatureName,
            },
        ],
        featureStrategies: [resultStrategy],
        featureEnvironments: [
            {
                enabled: false,
                environment: DEFAULT_ENV,
                featureName: defaultFeatureName,
            },
        ],
        segments: [
            {
                id: segment.id,
                name: segmentName,
            },
        ],
        dependencies: [
            {
                feature: defaultFeatureName,
                dependencies: [
                    {
                        feature: 'second_feature',
                        enabled: true,
                    },
                ],
            },
        ],
        links: [
            {
                feature: defaultFeatureName,
                links: [
                    { url: 'http://example1.com', title: 'link title 1' },
                    { url: 'http://example2.com', title: 'link title 2' },
                ],
            },
        ],
    });
});

test('exports features by tag', async () => {
    await createProjects();
    const strategy = {
        name: 'default',
        parameters: {
            rollout: '100',
            stickiness: 'default',
        },
        constraints: [
            {
                contextName: 'appName',
                values: ['test'],
                operator: 'IN' as const,
            },
        ],
    };
    await createFlag(
        {
            name: defaultFeatureName,
            description: 'the #1 feature',
        },
        strategy,
        ['mytag'],
    );
    await createFlag(
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
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const { name, ...resultStrategy } = strategy;
    expect(body).toMatchObject({
        features: [
            {
                name: defaultFeatureName,
            },
        ],
        featureStrategies: [resultStrategy],
        featureEnvironments: [
            {
                enabled: false,
                environment: DEFAULT_ENV,
                featureName: defaultFeatureName,
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
        parameters: {
            rollout: '100',
            stickiness: 'strategy-stickiness',
        },
        constraints: [
            {
                contextName: strategyContext.name,
                values: ['strategy-context-1', 'strategy-context-2'],
                operator: 'IN' as const,
            },
        ],
    };
    await createFlag(
        {
            name: defaultFeatureName,
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
    await createVariants(defaultFeatureName, [
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
            features: [defaultFeatureName],
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const { name, ...resultStrategy } = strategy;
    expect(body).toMatchObject({
        features: [
            {
                name: defaultFeatureName,
            },
        ],
        featureStrategies: [resultStrategy],
        featureEnvironments: [
            {
                enabled: false,
                environment: DEFAULT_ENV,
                featureName: defaultFeatureName,
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
    const featureName = defaultFeatureName;
    await createProjects();
    await createFlag(
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
            features: [defaultFeatureName],
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const { name, ...resultStrategy } = defaultStrategy;
    expect(body).toMatchObject({
        features: [
            {
                name: defaultFeatureName,
            },
        ],
        featureStrategies: [resultStrategy],
        featureEnvironments: [
            {
                enabled: false,
                environment: DEFAULT_ENV,
                featureName: defaultFeatureName,
            },
        ],
        featureTags: [
            {
                featureName,
                tagValue: 'tag1',
            },
        ],
    });
});

test('returns all features, when no explicit feature was requested', async () => {
    await createProjects();
    await createFlag({
        name: defaultFeatureName,
        description: 'the #1 feature',
    });
    await createFlag({
        name: 'second_feature',
        description: 'the #1 feature',
    });
    const { body } = await app.request
        .post('/api/admin/features-batch/export')
        .send({
            features: [],
            environment: DEFAULT_ENV,
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body.features).toHaveLength(2);
});

test('returns all project features', async () => {
    await createProjects();
    await createFlag({
        name: defaultFeatureName,
        description: 'the #1 feature',
    });
    await createFlag({
        name: 'second_feature',
        description: 'the #1 feature',
    });
    const { body } = await app.request
        .post('/api/admin/features-batch/export')
        .send({
            environment: DEFAULT_ENV,
            project: DEFAULT_PROJECT,
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body.features).toHaveLength(2);

    const { body: otherProject } = await app.request
        .post('/api/admin/features-batch/export')
        .send({
            environment: DEFAULT_ENV,
            features: [], // should be ignored because we have project
            project: 'other_project',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(otherProject.features).toHaveLength(0);
});

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
    name: defaultFeatureName,
    type: 'release',
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
    featureName: defaultFeatureName,
    id: '798cb25a-2abd-47bd-8a95-40ec13472309',
    name: 'default',
    parameters: {},
    constraints,
};

const tags = [
    {
        featureName: defaultFeatureName,
        tagType: 'simple',
        tagValue: 'tag1',
    },
    {
        featureName: defaultFeatureName,
        tagType: 'simple',
        tagValue: 'tag2',
    },
    {
        featureName: defaultFeatureName,
        tagType: 'special_tag',
        tagValue: 'feature_tagged',
    },
];

const resultTags = [
    {
        value: 'tag1',
        type: 'simple',
    },
    {
        value: 'tag2',
        type: 'simple',
    },
    {
        value: 'feature_tagged',
        type: 'special_tag',
    },
];

const tagTypes = [
    {
        name: 'bestt',
        description: 'test',
    },
    {
        name: 'special_tag',
        description: 'this is my special tag',
    },
    {
        name: 'special_tag',
        description: 'this is my special tag',
    }, // deliberate duplicate
];

const defaultImportPayload: ImportTogglesSchema = {
    data: {
        features: [exportedFeature],
        featureStrategies: [exportedStrategy],
        featureEnvironments: [
            {
                enabled: true,
                environment: 'irrelevant',
                featureName: defaultFeatureName,
                name: defaultFeatureName,
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

    const segment = await createSegment({
        name: 'newSegment',
        constraints: [],
    });

    await app.importToggles({
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            features: [
                ...defaultImportPayload.data.features,
                anotherExportedFeature,
            ],
            featureStrategies: [
                {
                    ...exportedStrategy,
                    segments: [segment.id],
                },
            ],
            segments: [
                {
                    id: segment.id,
                    name: segment.name,
                },
            ],
            dependencies: [
                {
                    feature: exportedFeature.name,
                    dependencies: [
                        {
                            feature: anotherExportedFeature.name,
                        },
                    ],
                },
            ],
            links: [
                {
                    feature: exportedFeature.name,
                    links: [
                        { url: 'http://example1.com', title: 'link title 1' },
                        { url: 'http://example2.com' },
                    ],
                },
            ],
        },
    });

    const { body: importedFeature } = await getFeature(defaultFeatureName);
    expect(importedFeature).toMatchObject({
        name: defaultFeatureName,
        project: DEFAULT_PROJECT,
        variants,
        environments: [
            {
                strategies: [
                    {
                        segments: [segment.id],
                    },
                ],
            },
        ],
        dependencies: [
            {
                feature: anotherExportedFeature.name,
            },
        ],
        links: [
            { title: 'link title 1', url: 'http://example1.com' },
            { title: null, url: 'http://example2.com' },
        ],
    });

    const { body: importedFeatureEnvironment } =
        await getFeatureEnvironment(defaultFeatureName);
    expect(importedFeatureEnvironment).toMatchObject({
        name: defaultFeatureName,
        environment: DEFAULT_ENV,
        enabled: true,
        strategies: [
            {
                featureName: defaultFeatureName,
                parameters: {},
                constraints,
                sortOrder: 0,
                name: 'default',
            },
        ],
    });

    const { body: importedTags } = await getTags(defaultFeatureName);
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
        tags: [
            {
                value: 'tag1',
                type: 'simple',
            },
        ],
    });
    expect(tags2).toMatchObject({
        version: 1,
        tags: [
            {
                value: 'tag1',
                type: 'simple',
            },
        ],
    });
});

test('import too many feature exceeding limit', async () => {
    const featureLimit = 1;
    await createProjects([DEFAULT_PROJECT], featureLimit);

    await app.importToggles(importWithMultipleFeatures, 403);
});

test('can update toggles on subsequent import', async () => {
    await createProjects();
    await app.importToggles(defaultImportPayload);
    await app.importToggles({
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            features: [
                {
                    ...exportedFeature,
                    type: 'operational',
                },
            ],
        },
    });

    const { body: importedFeature } = await getFeature(defaultFeatureName);
    expect(importedFeature).toMatchObject({
        name: defaultFeatureName,
        project: DEFAULT_PROJECT,
        type: 'operational',
        variants,
    });

    const { body: importedFeatureEnvironment } =
        await getFeatureEnvironment(defaultFeatureName);

    expect(importedFeatureEnvironment).toMatchObject({
        name: defaultFeatureName,
        environment: DEFAULT_ENV,
        enabled: true,
        strategies: [
            {
                featureName: defaultFeatureName,
                parameters: {},
                constraints,
                sortOrder: 0,
                name: 'default',
            },
        ],
    });
});

test('reject import with unknown context fields', async () => {
    await createProjects();
    const contextField = {
        name: 'ContextField1',
        legalValues: [
            {
                value: 'Value1',
                description: '',
            },
        ],
    };
    await app.createContextField(contextField);
    const importPayloadWithContextFields: ImportTogglesSchema = {
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            contextFields: [
                {
                    ...contextField,
                    legalValues: [
                        {
                            value: 'Value2',
                            description: '',
                        },
                    ],
                },
            ],
        },
    };

    const { body } = await app.importToggles(
        importPayloadWithContextFields,
        400,
    );

    expect(body.details[0].message).toMatch(/\bContextField1\b/);
});

test('reject import with unsupported strategies', async () => {
    await createProjects();
    const importPayloadWithContextFields: ImportTogglesSchema = {
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            featureStrategies: [
                {
                    name: 'customStrategy',
                    featureName: 'featureName',
                },
            ],
        },
    };

    const { body } = await app.importToggles(
        importPayloadWithContextFields,
        400,
    );

    expect(body.details[0].message).toMatch(/\bcustomStrategy\b/);
});

test('reject import with duplicate features', async () => {
    await createProjects();
    const importPayloadWithContextFields: ImportTogglesSchema = {
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            features: [exportedFeature, exportedFeature],
        },
    };

    const { body } = await app.importToggles(
        importPayloadWithContextFields,
        409,
    );

    expect(body.details[0].message).toBe(
        'A flag with that name already exists',
    );
});

test('validate import data', async () => {
    const featureLimit = 1;
    await createProjects([DEFAULT_PROJECT], featureLimit);

    const contextField: IContextFieldDto = {
        name: 'validate_context_field',
        legalValues: [{ value: 'Value1' }],
    };

    const createdContextField: IContextFieldDto = {
        name: 'created_context_field',
        legalValues: [{ value: 'new_value' }],
    };

    await app.createFeature(defaultFeatureName);
    await app.archiveFeature(defaultFeatureName);

    await app.createContextField(contextField);
    const importPayloadWithContextFields: ImportTogglesSchema = {
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            features: [
                exportedFeature,
                exportedFeature,
                anotherExportedFeature,
            ],
            featureStrategies: [{ name: 'customStrategy' }],
            segments: [
                {
                    id: 1,
                    name: 'customSegment',
                },
            ],
            contextFields: [
                {
                    ...contextField,
                    legalValues: [{ value: 'Value2' }],
                },
                createdContextField,
            ],
            dependencies: [
                {
                    feature: 'childFeature',
                    dependencies: [
                        {
                            feature: 'parentFeature',
                        },
                    ],
                },
            ],
        },
    };

    // note: this must be done after creating the feature on the earlier lines,
    // to prevent the pattern from blocking the creation.
    await projectStore.updateProjectEnterpriseSettings({
        id: DEFAULT_PROJECT,
        mode: 'open',
        featureNaming: { pattern: 'testpattern.+' },
    });

    const { body } = await validateImport(importPayloadWithContextFields, 200);

    expect(body).toMatchObject({
        errors: [
            {
                message:
                    'We detected the following custom strategy that needs to be created first:',
                affectedItems: ['customStrategy'],
            },
            {
                message:
                    'We detected the following context fields that do not have matching legal values with the imported ones:',
                affectedItems: [contextField.name],
            },
            {
                message:
                    'We detected the following features are duplicate in your import data:',
                affectedItems: [defaultFeatureName],
            },

            {
                message: expect.stringMatching(/\btestpattern.+\b/),
                affectedItems: [
                    defaultFeatureName,
                    anotherExportedFeature.name,
                ],
            },
            {
                message:
                    'We detected you want to create 2 new features to a project that already has 0 existing features, exceeding the maximum limit of 1.',
                affectedItems: [],
            },
            {
                message:
                    'We detected the following segments that need to be created first:',
                affectedItems: ['customSegment'],
            },
            {
                affectedItems: ['parentFeature'],
                message:
                    'We detected the following dependencies that need to be created first:',
            },
        ],
        warnings: [
            {
                message:
                    'The following features will not be imported as they are currently archived. To import them, please unarchive them first:',
                affectedItems: [defaultFeatureName],
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

    await app.archiveFeature(defaultFeatureName);

    await app.importToggles({
        ...defaultImportPayload,
        data: {
            ...defaultImportPayload.data,
            featureTags: [
                {
                    featureName: defaultFeatureName,
                    tagType: 'simple',
                    tagValue: 'tag2',
                },
            ],
        },
    });
    await unArchiveFeature(defaultFeatureName);

    const { body: importedTags } = await getTags(defaultFeatureName);
    expect(importedTags).toMatchObject({
        tags: resultTags,
    });
});

test('should not import archived parent', async () => {
    await createProjects();
    await app.createFeature('parent');
    await app.archiveFeature('parent');
    await app.importToggles({
        data: {
            features: [{ name: 'child' }, { name: 'parent' }],
            dependencies: [
                {
                    feature: 'child',
                    dependencies: [
                        {
                            feature: 'parent',
                        },
                    ],
                },
            ],
            featureStrategies: [],
            featureEnvironments: [],
            featureTags: [],
            tagTypes: [],
            contextFields: [],
            segments: [],
        },
        project: DEFAULT_PROJECT,
        environment: DEFAULT_ENV,
    });
    const { body } = await app.getProjectFeatures(DEFAULT_PROJECT);
    expect(body).toMatchObject({ features: [{ name: 'child' }] });
});

test('should not import archived child', async () => {
    await createProjects();
    await app.createFeature('child');
    await app.archiveFeature('child');
    await app.importToggles({
        data: {
            features: [{ name: 'child' }, { name: 'parent' }],
            dependencies: [
                {
                    feature: 'child',
                    dependencies: [
                        {
                            feature: 'parent',
                        },
                    ],
                },
            ],
            featureStrategies: [],
            featureEnvironments: [],
            featureTags: [],
            tagTypes: [],
            contextFields: [],
            segments: [],
        },
        project: DEFAULT_PROJECT,
        environment: DEFAULT_ENV,
    });
    const { body } = await app.getProjectFeatures(DEFAULT_PROJECT);
    expect(body).toMatchObject({ features: [{ name: 'parent' }] });
});

test(`should give errors with flag names if the flags don't match the project pattern`, async () => {
    await db.stores.environmentStore.create({
        name: DEFAULT_ENV,
        type: 'production',
    });

    const pattern = 'testpattern.+';
    for (const project of [DEFAULT_PROJECT]) {
        await db.stores.projectStore.create({
            name: project,
            description: '',
            id: project,
            mode: 'open' as const,
        });
        await db.stores.projectStore.updateProjectEnterpriseSettings({
            id: project,
            featureNaming: { pattern },
        });
        await app.linkProjectToEnvironment(project, DEFAULT_ENV);
    }

    const flagName = 'unusedfeaturenamethatdoesntmatchpattern';

    const { body } = await app.importToggles(
        {
            ...defaultImportPayload,
            data: {
                ...defaultImportPayload.data,
                features: [
                    {
                        project: 'old_project',
                        name: flagName,
                        type: 'release',
                    },
                ],
            },
        },
        400,
    );

    expect(body.message).toContain(pattern);
    expect(body.message).toContain(flagName);
});

test('should import features from file', async () => {
    await db.stores.environmentStore.create({
        name: DEFAULT_ENV,
        type: 'production',
    });

    await db.stores.projectStore.create({
        name: DEFAULT_PROJECT,
        description: '',
        id: DEFAULT_PROJECT,
        mode: 'open' as const,
    });
    await app.linkProjectToEnvironment(DEFAULT_PROJECT, DEFAULT_ENV);

    await app.services.importService.importFromFile(
        'src/lib/features/export-import-toggles/import-data.json',
        DEFAULT_PROJECT,
        DEFAULT_ENV,
    );
    const { body: importedFeature } = await getFeature(defaultFeatureName);
    expect(importedFeature).toMatchObject({
        name: defaultFeatureName,
        project: DEFAULT_PROJECT,
        type: 'release',
        variants,
    });
});
