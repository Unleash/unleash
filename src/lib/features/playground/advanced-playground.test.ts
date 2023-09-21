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
                    privateProjects: true,
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
    const variants = [
        {
            stickiness: 'random',
            name: 'a',
            weight: 1000,
            payload: {
                type: 'string',
                value: 'aval',
            },
            weightType: 'variable',
        },
    ];
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
            variants,
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
        expect(feature.variants).toMatchObject(variants);
    });
    disabledFeatures.forEach((feature) => {
        expect(feature.variant?.name).toBe('disabled');
        expect(feature.variants).toMatchObject([]);
    });
});
