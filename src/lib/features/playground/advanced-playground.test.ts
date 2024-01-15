import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { AdvancedPlaygroundResponseSchema } from '../../openapi';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('advanced_playground', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    advancedPlayground: true,
                    strictSchemaValidation: true,
                    strategyVariant: true,
                },
            },
        },
        db.rawDatabase,
    );
});

const createFeatureToggle = async (featureName: string) => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: featureName,
        })
        .set('Content-Type', 'application/json')
        .expect(201);
};

const createFeatureToggleWithStrategy = async (
    featureName: string,
    strategy = {
        name: 'default',
        parameters: {},
    } as any,
) => {
    await createFeatureToggle(featureName);
    return app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/default/strategies`,
        )
        .send(strategy)
        .expect(200);
};

const enableToggle = (featureName: string) =>
    app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/default/on`,
        )
        .send({})
        .expect(200);

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

afterEach(async () => {
    await db.stores.dependentFeaturesStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
});

test('advanced playground evaluation with no toggles', async () => {
    const { body: result } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
            environments: ['default'],
            projects: ['default'],
            context: { appName: 'test', userId: '1,2', channel: 'web,mobile' },
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(result).toMatchObject({
        input: {
            environments: ['default'],
            projects: ['default'],
            context: {
                appName: 'test',
                userId: '1,2',
                channel: 'web,mobile',
            },
        },
        features: [],
    });
});

test('advanced playground evaluation with parent dependency', async () => {
    await createFeatureToggle('test-parent');
    await createFeatureToggle('test-child');
    await enableToggle('test-child');
    await app.addDependency('test-child', 'test-parent');

    const { body: result } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
            environments: ['default'],
            projects: ['default'],
            context: { appName: 'test' },
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const child = result.features[0].environments.default[0];
    const parent = result.features[1].environments.default[0];
    // child is disabled because of the parent
    expect(child.hasUnsatisfiedDependency).toBe(true);
    expect(child.isEnabled).toBe(false);
    expect(child.isEnabledInCurrentEnvironment).toBe(true);
    expect(child.variant).toEqual({
        name: 'disabled',
        enabled: false,
        feature_enabled: false,
    });
    expect(parent.hasUnsatisfiedDependency).toBe(false);
    expect(parent.isEnabled).toBe(false);
});

test('advanced playground evaluation happy path', async () => {
    await createFeatureToggleWithStrategy('test-playground-feature');
    await enableToggle('test-playground-feature');

    const { body: result } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
            environments: ['default'],
            projects: ['default'],
            context: { appName: 'test', userId: '1,2', channel: 'web,mobile' },
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(result).toMatchObject({
        input: {
            environments: ['default'],
            projects: ['default'],
            context: {
                appName: 'test',
                userId: '1,2',
                channel: 'web,mobile',
            },
        },
        features: [
            {
                name: 'test-playground-feature',
                projectId: 'default',
                environments: {
                    default: [
                        {
                            isEnabled: true,
                            isEnabledInCurrentEnvironment: true,
                            hasUnsatisfiedDependency: false,
                            strategies: {
                                result: true,
                                data: [
                                    {
                                        name: 'default',
                                        disabled: false,
                                        parameters: {},
                                        result: {
                                            enabled: true,
                                            evaluationStatus: 'complete',
                                        },
                                        constraints: [],
                                        segments: [],
                                    },
                                ],
                            },
                            projectId: 'default',
                            variant: {
                                name: 'disabled',
                                enabled: false,
                            },
                            name: 'test-playground-feature',
                            environment: 'default',
                            context: {
                                appName: 'test',
                                userId: '1',
                                channel: 'web',
                            },
                            variants: [],
                        },
                        {
                            isEnabled: true,
                            isEnabledInCurrentEnvironment: true,
                            hasUnsatisfiedDependency: false,
                            strategies: {
                                result: true,
                                data: [
                                    {
                                        name: 'default',
                                        disabled: false,
                                        parameters: {},
                                        result: {
                                            enabled: true,
                                            evaluationStatus: 'complete',
                                        },
                                        constraints: [],
                                        segments: [],
                                    },
                                ],
                            },
                            projectId: 'default',
                            variant: {
                                name: 'disabled',
                                enabled: false,
                            },
                            name: 'test-playground-feature',
                            environment: 'default',
                            context: {
                                appName: 'test',
                                userId: '1',
                                channel: 'mobile',
                            },
                            variants: [],
                        },
                        {
                            isEnabled: true,
                            isEnabledInCurrentEnvironment: true,
                            hasUnsatisfiedDependency: false,
                            strategies: {
                                result: true,
                                data: [
                                    {
                                        name: 'default',
                                        disabled: false,
                                        parameters: {},
                                        result: {
                                            enabled: true,
                                            evaluationStatus: 'complete',
                                        },
                                        constraints: [],
                                        segments: [],
                                    },
                                ],
                            },
                            projectId: 'default',
                            variant: {
                                name: 'disabled',
                                enabled: false,
                            },
                            name: 'test-playground-feature',
                            environment: 'default',
                            context: {
                                appName: 'test',
                                userId: '2',
                                channel: 'web',
                            },
                            variants: [],
                        },
                        {
                            isEnabled: true,
                            isEnabledInCurrentEnvironment: true,
                            hasUnsatisfiedDependency: false,
                            strategies: {
                                result: true,
                                data: [
                                    {
                                        name: 'default',
                                        disabled: false,
                                        parameters: {},
                                        result: {
                                            enabled: true,
                                            evaluationStatus: 'complete',
                                        },
                                        constraints: [],
                                        segments: [],
                                    },
                                ],
                            },
                            projectId: 'default',
                            variant: {
                                name: 'disabled',
                                enabled: false,
                            },
                            name: 'test-playground-feature',
                            environment: 'default',
                            context: {
                                appName: 'test',
                                userId: '2',
                                channel: 'mobile',
                            },
                            variants: [],
                        },
                    ],
                },
            },
        ],
    });
});
test('show matching variant from variants selection only for enabled toggles', async () => {
    const variant = {
        stickiness: 'random',
        name: 'a',
        weight: 1000,
        payload: {
            type: 'string',
            value: 'aval',
        },
        weightType: 'variable',
    };

    await createFeatureToggleWithStrategy(
        'test-playground-feature-with-variants',
        {
            name: 'flexibleRollout',
            constraints: [],
            parameters: {
                rollout: '50',
                stickiness: 'random',
                groupId: 'test-playground-feature-with-variants',
            },
            variants: [variant],
        },
    );

    await enableToggle('test-playground-feature-with-variants');

    const { body: result } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
            environments: ['default'],
            projects: ['default'],
            context: { appName: 'playground', someProperty: '1,2,3,4,5' }, // generate 5 combinations
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const typedResult: AdvancedPlaygroundResponseSchema = result;
    const enabledFeatures = typedResult.features[0].environments.default.filter(
        (item) => item.isEnabled,
    );
    const disabledFeatures =
        typedResult.features[0].environments.default.filter(
            (item) => !item.isEnabled,
        );

    enabledFeatures.forEach((feature) => {
        expect(feature.variant?.name).toBe('a');
        expect(feature.variants).toMatchObject([variant]);
    });
    disabledFeatures.forEach((feature) => {
        expect(feature.variant?.name).toBe('disabled');
        expect(feature.variants).toMatchObject([]);
    });
});

test('should return disabled strategies with unevaluated result', async () => {
    await createFeatureToggleWithStrategy(
        'test-playground-feature-with-disabled-strategy',
        {
            name: 'flexibleRollout',
            constraints: [],
            disabled: true,
            parameters: {
                rollout: '50',
                stickiness: 'random',
                groupId: 'test-playground-feature-with-variants',
            },
        },
    );

    const { body: result } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
            environments: ['default'],
            projects: ['default'],
            context: { appName: 'playground' },
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    const typedResult: AdvancedPlaygroundResponseSchema = result;

    const feature = typedResult.features.find(
        (feature) =>
            feature.name === 'test-playground-feature-with-disabled-strategy',
    );

    expect(
        feature?.environments.default[0].strategies.data[0].result
            .evaluationStatus,
    ).toBe('unevaluated');
});
