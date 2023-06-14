import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';

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

const createFeatureToggleWithStrategy = async (featureName: string) => {
    await createFeatureToggle(featureName);
    return app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/default/strategies`,
        )
        .send({
            name: 'default',
            parameters: {},
        })
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
