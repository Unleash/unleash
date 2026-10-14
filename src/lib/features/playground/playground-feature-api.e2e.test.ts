import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { DEFAULT_ENV } from '../../util/index.js';

let app: IUnleashTest;
let db: ITestDb;

const evaluateFeature = (
    featureName: string,
    context: Record<string, unknown>,
    expectedCode = 200,
    environment = DEFAULT_ENV,
) =>
    app.request
        .post(`/api/admin/playground/features/${featureName}`)
        .send({ environment, context: { appName: 'test', ...context } })
        .expect(expectedCode);

const createProject = async (id: string) => {
    await db.stores.projectStore.create({
        id,
        name: id,
        description: '',
        mode: 'open' as const,
    });
    await app.linkProjectToEnvironment(id, DEFAULT_ENV);
};

beforeAll(async () => {
    db = await dbInit('playground_feature_api', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    playgroundFeatureEvaluation: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('evaluates a single flag against the given context', async () => {
    await app.createFeature('user-constrained');
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
            constraints: [
                {
                    contextName: 'userId',
                    operator: 'IN',
                    values: ['123'],
                },
            ],
        },
        DEFAULT_ENV,
        'user-constrained',
    );
    await app.enableFeature('user-constrained', DEFAULT_ENV);

    const { body: matching } = await evaluateFeature('user-constrained', {
        userId: '123',
    });
    expect(matching.feature).toMatchObject({
        name: 'user-constrained',
        projectId: 'default',
        isEnabled: true,
    });
    expect(matching.input).toMatchObject({
        environment: DEFAULT_ENV,
        context: { userId: '123' },
    });

    const { body: nonMatching } = await evaluateFeature('user-constrained', {
        userId: '456',
    });
    expect(nonMatching.feature.isEnabled).toBe(false);
});

test('resolves the project from the flag name', async () => {
    await createProject('other-project');
    await app.createFeature('flag-in-other-project', 'other-project');
    await app.addStrategyToFeatureEnv(
        { name: 'default' },
        DEFAULT_ENV,
        'flag-in-other-project',
        'other-project',
    );
    await app.enableFeature(
        'flag-in-other-project',
        DEFAULT_ENV,
        'other-project',
    );

    const { body } = await evaluateFeature('flag-in-other-project', {});

    expect(body.feature).toMatchObject({
        name: 'flag-in-other-project',
        projectId: 'other-project',
        isEnabled: true,
    });
});

test('returns the evaluated variant', async () => {
    await app.createFeature('variant-flag');
    await app.addStrategyToFeatureEnv(
        {
            name: 'flexibleRollout',
            constraints: [],
            parameters: { rollout: '100', stickiness: 'default' },
            variants: [
                {
                    name: 'blue',
                    weight: 1000,
                    weightType: 'variable',
                    stickiness: 'default',
                },
            ],
        },
        DEFAULT_ENV,
        'variant-flag',
    );
    await app.enableFeature('variant-flag', DEFAULT_ENV);

    const { body } = await evaluateFeature('variant-flag', { userId: '1' });

    expect(body.feature.variant).toMatchObject({
        name: 'blue',
        enabled: true,
    });
});

test('takes parent flags into account', async () => {
    await app.createFeature('parent-flag');
    await app.createFeature('child-flag');
    await app.addDependency('child-flag', 'parent-flag');
    await app.addStrategyToFeatureEnv(
        { name: 'default' },
        DEFAULT_ENV,
        'child-flag',
    );
    await app.enableFeature('child-flag', DEFAULT_ENV);

    const { body: parentDisabled } = await evaluateFeature('child-flag', {});
    expect(parentDisabled.feature).toMatchObject({
        name: 'child-flag',
        isEnabled: false,
        hasUnsatisfiedDependency: true,
    });

    await app.addStrategyToFeatureEnv(
        { name: 'default' },
        DEFAULT_ENV,
        'parent-flag',
    );
    await app.enableFeature('parent-flag', DEFAULT_ENV);

    const { body: parentEnabled } = await evaluateFeature('child-flag', {});
    expect(parentEnabled.feature).toMatchObject({
        name: 'child-flag',
        isEnabled: true,
        hasUnsatisfiedDependency: false,
    });
});

test('returns 404 for an unknown flag', async () => {
    await evaluateFeature('does-not-exist', {}, 404);
});

test('returns 404 for an archived flag', async () => {
    await app.createFeature('archived-flag');
    await app.archiveFeature('archived-flag');

    await evaluateFeature('archived-flag', {}, 404);
});

test('returns 404 when the experimental flag is disabled', async () => {
    const disabledApp = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: { playgroundFeatureEvaluation: false },
            },
        },
        db.rawDatabase,
    );
    await app.createFeature('flag-behind-experiment');

    await disabledApp.request
        .post('/api/admin/playground/features/flag-behind-experiment')
        .send({ environment: DEFAULT_ENV, context: { appName: 'test' } })
        .expect(404);

    await disabledApp.destroy();
});
