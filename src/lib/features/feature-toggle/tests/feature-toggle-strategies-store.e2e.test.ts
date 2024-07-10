import type { IFeatureStrategiesStore } from '../../../features/feature-toggle/types/feature-toggle-strategies-store-type';
import type { IFeatureToggleStore } from '../../../features/feature-toggle/types/feature-toggle-store-type';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init';
import getLogger from '../../../../test/fixtures/no-logger';
import type {
    IConstraint,
    IFeatureStrategiesReadModel,
    IProjectStore,
    IUnleashStores,
} from '../../../types';
import { randomId } from '../../../util';

let stores: IUnleashStores;
let db: ITestDb;
let featureStrategiesStore: IFeatureStrategiesStore;
let featureToggleStore: IFeatureToggleStore;
let projectStore: IProjectStore;
let featureStrategiesReadModel: IFeatureStrategiesReadModel;

const featureName = 'test-strategies-move-project';

beforeAll(async () => {
    db = await dbInit('feature_strategies_store_serial', getLogger);
    stores = db.stores;
    featureStrategiesStore = stores.featureStrategiesStore;
    featureToggleStore = stores.featureToggleStore;
    projectStore = stores.projectStore;
    featureStrategiesReadModel = stores.featureStrategiesReadModel;
    await featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
});

afterEach(async () => {
    await featureStrategiesStore.deleteAll();
});

afterAll(async () => {
    await db.destroy();
});

test('Can successfully update project for all strategies belonging to feature', async () => {
    const newProjectId = 'different-project';
    const oldProjectId = 'default';
    const environment = 'default';
    await featureStrategiesStore.createStrategyFeatureEnv({
        strategyName: 'default',
        projectId: oldProjectId,
        environment,
        featureName,
        constraints: [],
        parameters: {},
        sortOrder: 15,
    });
    await featureStrategiesStore.createStrategyFeatureEnv({
        strategyName: 'default',
        projectId: oldProjectId,
        environment,
        featureName,
        constraints: [],
        parameters: {},
        sortOrder: 20,
    });
    const strats = await featureStrategiesStore.getStrategiesForFeatureEnv(
        oldProjectId,
        featureName,
        environment,
    );
    expect(strats).toHaveLength(2);
    await featureStrategiesStore.setProjectForStrategiesBelongingToFeature(
        featureName,
        newProjectId,
    );
    const newProjectStrats =
        await featureStrategiesStore.getStrategiesForFeatureEnv(
            newProjectId,
            featureName,
            environment,
        );
    expect(newProjectStrats).toHaveLength(2);

    const oldProjectStrats =
        await featureStrategiesStore.getStrategiesForFeatureEnv(
            oldProjectId,
            featureName,
            environment,
        );
    return expect(oldProjectStrats).toHaveLength(0);
});

test('Can query for features with tags', async () => {
    const tag = { type: 'simple', value: 'hello-tags' };
    await stores.tagStore.createTag(tag);
    await featureToggleStore.create('default', {
        name: 'to-be-tagged',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'not-tagged',
        createdByUserId: 9999,
    });
    await stores.featureTagStore.tagFeature('to-be-tagged', tag, -1337);
    const features = await featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
        tag: [[tag.type, tag.value]],
    });
    expect(features).toHaveLength(1);
});

test('Can query for features with namePrefix', async () => {
    await featureToggleStore.create('default', {
        name: 'nameprefix-to-be-hit',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'nameprefix-not-be-hit',
        createdByUserId: 9999,
    });
    const features = await featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
        namePrefix: 'nameprefix-to',
    });
    expect(features).toHaveLength(1);
});

test('Can query for features with namePrefix and tags', async () => {
    const tag = { type: 'simple', value: 'hello-nameprefix-and-tags' };
    await stores.tagStore.createTag(tag);
    await featureToggleStore.create('default', {
        name: 'to-be-tagged-nameprefix-and-tags',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'not-tagged-nameprefix-and-tags',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'tagged-but-not-hit-nameprefix-and-tags',
        createdByUserId: 9999,
    });
    await stores.featureTagStore.tagFeature(
        'to-be-tagged-nameprefix-and-tags',
        tag,
        9999,
    );
    await stores.featureTagStore.tagFeature(
        'tagged-but-not-hit-nameprefix-and-tags',
        tag,
        9999,
    );
    const features = await featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
        tag: [[tag.type, tag.value]],
        namePrefix: 'to',
    });
    expect(features).toHaveLength(1);
});

describe('strategy parameters default to sane defaults', () => {
    test('Creating a gradualRollout strategy with no parameters uses the default for all necessary fields', async () => {
        const toggle = await featureToggleStore.create('default', {
            name: 'testing-strategy-parameters',
            createdByUserId: 9999,
        });
        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            strategyName: 'flexibleRollout',
            projectId: 'default',
            environment: 'default',
            featureName: toggle.name,
            constraints: [],
            sortOrder: 15,
            parameters: {},
        });
        expect(strategy.parameters).toEqual({
            rollout: '100',
            groupId: toggle.name,
            stickiness: 'default',
        });
    });
    test('Creating a gradualRollout strategy with some parameters, only uses defaults for those not set', async () => {
        const toggle = await featureToggleStore.create('default', {
            name: 'testing-strategy-parameters-with-some-parameters',
            createdByUserId: 9999,
        });
        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            strategyName: 'flexibleRollout',
            projectId: 'default',
            environment: 'default',
            featureName: toggle.name,
            constraints: [],
            sortOrder: 15,
            parameters: {
                rollout: '60',
                stickiness: 'userId',
            },
        });
        expect(strategy.parameters).toEqual({
            rollout: '60',
            groupId: toggle.name,
            stickiness: 'userId',
        });
    });
    test('Creating an applicationHostname strategy does not get unnecessary parameters set', async () => {
        const toggle = await featureToggleStore.create('default', {
            name: 'testing-strategy-parameters-for-applicationHostname',
            createdByUserId: 9999,
        });
        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            strategyName: 'applicationHostname',
            projectId: 'default',
            environment: 'default',
            featureName: toggle.name,
            constraints: [],
            sortOrder: 15,
            parameters: {
                hostnames: 'myfantastichost',
            },
        });
        expect(strategy.parameters).toEqual({
            hostnames: 'myfantastichost',
        });
    });
    test('Strategy picks the default stickiness set for the project', async () => {
        const project = await projectStore.create({
            name: 'customDefaultStickiness',
            id: 'custom_default_stickiness',
        });
        const defaultStickiness = 'userId';
        await db.rawDatabase.raw(
            `UPDATE project_settings SET default_stickiness = ? WHERE project = ?`,
            [defaultStickiness, project.id],
        );
        const toggle = await featureToggleStore.create(project.id, {
            name: 'testing-default-strategy-on-project',
            createdByUserId: 9999,
        });
        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            strategyName: 'flexibleRollout',
            projectId: project.id,
            environment: 'default',
            featureName: toggle.name,
            constraints: [],
            sortOrder: 15,
            parameters: {},
        });
        expect(strategy.parameters.stickiness).toBe(defaultStickiness);
    });
});

describe('max metrics collection', () => {
    test('Read feature with max number of strategies', async () => {
        const toggle = await featureToggleStore.create('default', {
            name: 'featureA',
            createdByUserId: 9999,
        });

        const maxStrategiesBefore =
            await featureStrategiesReadModel.getMaxFeatureStrategies();
        const maxEnvStrategiesBefore =
            await featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies();
        expect(maxStrategiesBefore).toBe(null);
        expect(maxEnvStrategiesBefore).toBe(null);

        await featureStrategiesStore.createStrategyFeatureEnv({
            strategyName: 'gradualRollout',
            projectId: 'default',
            environment: 'default',
            featureName: toggle.name,
            constraints: [],
            sortOrder: 0,
            parameters: {},
        });
        await featureStrategiesStore.createStrategyFeatureEnv({
            strategyName: 'gradualRollout',
            projectId: 'default',
            environment: 'default',
            featureName: toggle.name,
            constraints: [],
            sortOrder: 0,
            parameters: {},
        });

        const maxStrategies =
            await featureStrategiesReadModel.getMaxFeatureStrategies();
        const maxEnvStrategies =
            await featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies();
        expect(maxStrategies).toEqual({ feature: 'featureA', count: 2 });
        expect(maxEnvStrategies).toEqual({
            feature: 'featureA',
            environment: 'default',
            count: 2,
        });
    });

    const bigConstraint = (maxValueCount: number) => {
        return {
            values: Array.from({ length: maxValueCount }, (_, i) =>
                i.toString(),
            ),
            operator: 'IN',
            contextName: 'appName',
        } as const;
    };

    const strategyWithConstraints = (
        feature: string,
        constraint: IConstraint,
    ) => {
        return {
            strategyName: 'gradualRollout',
            projectId: 'default',
            environment: 'default',
            featureName: feature,
            constraints: [constraint],

            sortOrder: 0,
            parameters: {},
        };
    };

    test('Read feature with max number of constraint values', async () => {
        const flagA = await featureToggleStore.create('default', {
            name: randomId(),
            createdByUserId: 9999,
        });

        const flagB = await featureToggleStore.create('default', {
            name: randomId(),
            createdByUserId: 9999,
        });

        const flagC = await featureToggleStore.create('default', {
            name: randomId(),
            createdByUserId: 9999,
        });

        const maxConstraintValuesBefore =
            await featureStrategiesReadModel.getMaxConstraintValues();
        expect(maxConstraintValuesBefore).toBe(null);

        const maxValueCount = 100;
        await featureStrategiesStore.createStrategyFeatureEnv(
            strategyWithConstraints(flagA.name, bigConstraint(maxValueCount)),
        );
        await featureStrategiesStore.createStrategyFeatureEnv(
            strategyWithConstraints(flagB.name, {
                operator: 'IN',
                contextName: 'appName',
            }),
        );
        await featureStrategiesStore.createStrategyFeatureEnv(
            strategyWithConstraints(
                flagC.name,
                bigConstraint(maxValueCount + 1),
            ),
        );

        await featureToggleStore.archive(flagC.name);

        const maxConstraintValues =
            await featureStrategiesReadModel.getMaxConstraintValues();
        expect(maxConstraintValues).toEqual({
            feature: flagA.name,
            environment: 'default',
            count: maxValueCount,
        });
    });

    test('Read feature strategy with max number of constraints', async () => {
        const flagA = await featureToggleStore.create('default', {
            name: randomId(),
            createdByUserId: 9999,
        });

        const flagB = await featureToggleStore.create('default', {
            name: randomId(),
            createdByUserId: 9999,
        });

        const maxConstraintValuesBefore =
            await featureStrategiesReadModel.getMaxConstraintsPerStrategy();
        expect(maxConstraintValuesBefore).toBe(null);

        await featureStrategiesStore.createStrategyFeatureEnv({
            strategyName: 'gradualRollout',
            projectId: 'default',
            environment: 'default',
            featureName: flagA.name,
            constraints: [
                {
                    values: ['blah'],
                    operator: 'IN',
                    contextName: 'appName',
                },
                {
                    values: ['blah'],
                    operator: 'IN',
                    contextName: 'appName',
                },
            ],

            sortOrder: 0,
            parameters: {},
        });
        await featureStrategiesStore.createStrategyFeatureEnv({
            strategyName: 'gradualRollout',
            projectId: 'default',
            environment: 'default',
            featureName: flagB.name,
            constraints: [],
            sortOrder: 0,
            parameters: {},
        });

        const maxConstraintValues =
            await featureStrategiesReadModel.getMaxConstraintsPerStrategy();
        expect(maxConstraintValues).toEqual({
            feature: flagA.name,
            environment: 'default',
            count: 2,
        });
    });
});
